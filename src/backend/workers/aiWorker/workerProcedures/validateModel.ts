import logger from "../../../utils/logger";
import { workerDB } from "../../../database/database";
import Data from "../../../data_clients/datainterfaces";
import SVMTrainer from "../../../workers/aiWorker/SVMTrainer";
import NSAIWorker from "../../../workers/aiWorker/aiWorkerTypes";
import { GenericWorkerTypes } from "../../common/datatypes";

export async function validateModel(
  event: NSAIWorker.Request.IStartValidate
): Promise<NSAIWorker.Response.IEndValidate> {
  logger("Begin Model Validation");
  const labelVocab: Record<string, number> = {};
  let maxLabelId: number = 0;
  const trainingFormat: { samples: number[][]; labels: number[] } = {
    samples: [],
    labels: [],
  };

  const labeledTFIDFArray = (await workerDB.vector
    .where("hasLabel")
    .equals(1)
    .toArray()) as Required<Data.Vector>[];
  logger(`Fetched ${labeledTFIDFArray.length} labeled examples`);
  labeledTFIDFArray.forEach((tf) => {
    trainingFormat.samples.push(tf.vector);
    if (!labelVocab[tf.label]) {
      labelVocab[tf.label] = 1 + maxLabelId - 1;
      maxLabelId += 1;
    }
    let labelId = labelVocab[tf.label];
    trainingFormat.labels.push(labelId);
  });
  const inverseLabelVoab: Record<number, string> = {};
  for (const key in labelVocab) {
    const lid = labelVocab[key];
    inverseLabelVoab[lid] = key;
  }
  logger(`Loading Trainer`);
  const trainer = new SVMTrainer();
  await trainer.init();
  logger(`Trainer Initialized`);
  for await (let result of trainer.kFoldEvaluate(
    trainingFormat.samples,
    trainingFormat.labels,
    15,
    inverseLabelVoab
  )) {
    logger(`Finished a loop. Sending to db`);
    const adjusted = result.map((x) => ({
      ...x,
      label: x.label,
    }));
    logger(adjusted);
    await workerDB.kfold.bulkAdd(adjusted.filter((x) => x.label !== undefined));
    logger(`Inserted starting next`);
  }
  logger(`Finished KFOLD Evaluation`);
  return {
    workerName: GenericWorkerTypes.EWorkerName.ai,
    requestId: event.requestId,
    direction: GenericWorkerTypes.ERquestOrResponesOrUpdate.response,
    kind: NSAIWorker.AIResponseMessageKind.endValidation,
    payload: {},
  };
}
