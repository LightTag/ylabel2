import * as tf from "@tensorflow/tfjs";
import negativeLabelsCrossEntropy from "./customLayers";
import { tfTFIDFDataLoader } from "./tfVectorDataLoader";
import { workerDB } from "../../../../database/database";
import logger from "../../../../utils/logger";

function modelFactory(inputShape: number, numLabels: number) {
  const model = tf.sequential();
  model.add(
    tf.layers.dense({
      units: 64,
      inputShape: [inputShape],
      activation: "relu",
    })
  );
  model.add(
    tf.layers.dense({
      units: numLabels,
      activation: "linear",
    })
  );

  model.add(tf.layers.softmax());
  model.compile({
    optimizer: "adam",

    loss: negativeLabelsCrossEntropy,
    metrics: ["categoricalAccuracy"],
  });

  return model;
}

//@ts-ignore
function onBatchEnd(batch, logs) {
  logger("Accuracy", logs);
}

export async function trainTFModel() {
  // TODO take a paramater that specifies the vector source
  const data = await tfTFIDFDataLoader();
  const inputSize = data.featuresTensor.shape[1] as number;
  const numLabels = await workerDB.label.count();
  const model = modelFactory(inputSize, numLabels);

  logger(data);
  await model.fit(data.featuresTensor, data.labelMaskTensor, {
    callbacks: { onBatchEnd },
    epochs: 10,
    batchSize: 32,
  });
  return { model, labelsToId: data.labelsToId, idsToLabel: data.idsToLabel };
}

function predictOne(
  model: tf.Sequential,
  example: { exampleId: string; vector: number[] },

  idsToLabel: Record<number, string>
): {
  labelId: number;
  confidence: number;
  exampleId: string;
  predictedLabel: string;
  hasPrediction: 1 | -1;
} {
  const exampleSoftmax = model.predict(
    tf.tensor([example.vector])
  ) as tf.Tensor;
  const labelId = exampleSoftmax.argMax(-1).dataSync()[0];
  const confidence = exampleSoftmax.max(-1).dataSync()[0];

  const predictedLabel = idsToLabel[labelId];
  return {
    exampleId: example.exampleId,
    confidence,
    predictedLabel,
    labelId,
    hasPrediction: 1,
  };
}

export async function predictAll(
  model: tf.Sequential,
  idsToLabel: Record<number, string>
) {
  //TODO make the vector source a paramater
  const unlabeledExamples = await workerDB.tfidf
    .where("hasLabel")
    .equals(-1)
    .limit(200)
    .toArray();
  const results = tf.tidy(() => {
    const results = unlabeledExamples.map((x) =>
      predictOne(model, { exampleId: x.exampleId, vector: x.arr }, idsToLabel)
    );
    return results;
  });

  return results;
}
