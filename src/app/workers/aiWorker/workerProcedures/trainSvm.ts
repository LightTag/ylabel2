import { TableNames, workerDB } from "app/database/database";
import Data from "app/data_clients/datainterfaces";
import SVMTrainer from "app/workers/aiWorker/SVMTrainer";
import NSAIWorker from "app/workers/aiWorker/aiWorkerTypes";
import { GenericWorkerTypes } from "app/workers/common/datatypes";
import EWorkerName = GenericWorkerTypes.EWorkerName;
import ERquestOrResponesOrUpdate = GenericWorkerTypes.ERquestOrResponesOrUpdate;
import AIResponseMessageKind = NSAIWorker.AIResponseMessageKind;
import { trainTFModel } from "app/workers/aiWorker/workerProcedures/tfmodel/basicModel";

export async function trainSVM(
  event: NSAIWorker.Request.IStartFitPredict
): Promise<NSAIWorker.Response.IEndFitPredict> {
  const labelVocab: Record<string, number> = {};
  let maxLabelId: number = 0;
  const trainingFormat: { samples: number[][]; labels: number[] } = {
    samples: [],
    labels: [],
  };
  await trainTFModel();
  return;
  const labeledTFIDFArray = (await workerDB.vector
    .where("hasLabel")
    .equals(1)
    .toArray()) as Required<Data.Vector>[];
  labeledTFIDFArray.forEach((tf) => {
    trainingFormat.samples.push(tf.vector);
    if (!labelVocab[tf.label]) {
      labelVocab[tf.label] = 1 + maxLabelId - 1;
      maxLabelId += 1;
    }
    let labelId = labelVocab[tf.label];
    trainingFormat.labels.push(labelId);
  });
  console.log(labelVocab);
  const inverseLabelVoab: Record<number, string> = {};
  for (const key in labelVocab) {
    const lid = labelVocab[key];
    inverseLabelVoab[lid] = key;
  }
  const unlabeledExamples = await workerDB.vector
    .where("hasLabel")
    .equals(-1)
    .limit(200)
    .toArray();
  const unlabeledTfIDF = unlabeledExamples.map((x) => x.vector);

  const trainer = new SVMTrainer();
  await trainer.init();

  console.log(trainingFormat);
  trainer.model.train(trainingFormat);
  const result = trainer.model.predictProbability({ samples: unlabeledTfIDF });
  const updates = result.map((res, ix) => {
    const exampleId = unlabeledExamples[ix].exampleId;
    const predictedLabel = inverseLabelVoab[res.prediction];
    const update = {
      exampleId,
      update: {
        predictedLabel,
        hasPrediction: 1,
        confidence: res.estimates[res.prediction].probability,
      },
    };
    return update;
  });
  await workerDB.transaction("rw", "example" as TableNames, async (tx) => {
    await Promise.all(
      updates.map((update) => {
        workerDB.example.update(update.exampleId, update.update);
      })
    );
  });
  console.log(
    result.map((x) => ({
      label: inverseLabelVoab[x.prediction],
      est: x.estimates,
    }))
  );
  return {
    workerName: EWorkerName.ai,
    requestId: event.requestId,
    direction: ERquestOrResponesOrUpdate.response,
    kind: AIResponseMessageKind.endFitPredict,
    payload: {},
  };
}
