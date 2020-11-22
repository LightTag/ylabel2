import { TableNames, workerDB } from "../../../database/database";
import NSAIWorker from "../aiWorkerTypes";
import { GenericWorkerTypes } from "../../common/datatypes";
import { predictAll, trainTFModel } from "./tfmodel/basicModel";

export async function trainSVM(
  event: NSAIWorker.Request.IStartFitPredict
): Promise<NSAIWorker.Response.IEndFitPredict> {
  const trained = await trainTFModel();
  const predictions = await predictAll(trained.model, trained.idsToLabel);
  await workerDB.transaction("rw", "example" as TableNames, async (tx) => {
    await Promise.all(
      predictions.map((update) => {
        workerDB.example.update(update.exampleId, update);
      })
    );
  });
  return {
    workerName: GenericWorkerTypes.EWorkerName.ai,
    requestId: event.requestId,
    direction: GenericWorkerTypes.ERquestOrResponesOrUpdate.response,
    kind: NSAIWorker.AIResponseMessageKind.endFitPredict,
    payload: {},
  };
  // const labeledTFIDFArray = (await workerDB.vector
  //   .where("hasLabel")
  //   .equals(1)
  //   .toArray()) as Required<Data.Vector>[];
  // labeledTFIDFArray.forEach((tf) => {
  //   trainingFormat.samples.push(tf.vector);
  //   if (!labelVocab[tf.label]) {
  //     labelVocab[tf.label] = 1 + maxLabelId - 1;
  //     maxLabelId += 1;
  //   }
  //   let labelId = labelVocab[tf.label];
  //   trainingFormat.labels.push(labelId);
  // });
  // console.log(labelVocab);
  // const inverseLabelVoab: Record<number, string> = {};
  // for (const key in labelVocab) {
  //   const lid = labelVocab[key];
  //   inverseLabelVoab[lid] = key;
  // }
  // const unlabeledExamples = await workerDB.vector
  //   .where("hasLabel")
  //   .equals(-1)
  //   .limit(200)
  //   .toArray();
  // const unlabeledTfIDF = unlabeledExamples.map((x) => x.vector);
  //
  // const trainer = new SVMTrainer();
  // await trainer.init();
  //
  // console.log(trainingFormat);
  // trainer.model.train(trainingFormat);
  // const result = trainer.model.predictProbability({ samples: unlabeledTfIDF });
  // const updates = result.map((res, ix) => {
  //   const exampleId = unlabeledExamples[ix].exampleId;
  //   const predictedLabel = inverseLabelVoab[res.prediction];
  //   const update = {
  //     exampleId,
  //     update: {
  //       predictedLabel,
  //       hasPrediction: 1,
  //       confidence: res.estimates[res.prediction].probability,
  //     },
  //   };
  //   return update;
  // });
  // await workerDB.transaction("rw", "example" as TableNames, async (tx) => {
  //   await Promise.all(
  //     updates.map((update) => {
  //       workerDB.example.update(update.exampleId, update.update);
  //     })
  //   );
  // });
  // console.log(
  //   result.map((x) => ({
  //     label: inverseLabelVoab[x.prediction],
  //     est: x.estimates,
  //   }))
  // );
  // return {
  //   workerName: EWorkerName.ai,
  //   requestId: event.requestId,
  //   direction: ERquestOrResponesOrUpdate.response,
  //   kind: AIResponseMessageKind.endFitPredict,
  //   payload: {},
  // };
}
