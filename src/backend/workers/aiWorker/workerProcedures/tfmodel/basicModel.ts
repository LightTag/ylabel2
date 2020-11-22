import * as tf from "@tensorflow/tfjs";
import negativeLabelsCrossEntropy from "./customLayers";
import tfDataLoader from "./tfDataLoader";
import { workerDB } from "../../../../database/database";
import Data from "../../../../data_clients/datainterfaces";

function modelFactory(numLabels: number) {
  const model = tf.sequential();
  model.add(
    tf.layers.dense({
      units: 64,
      inputShape: [512],
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
  console.log("Accuracy", logs);
}

export async function trainTFModel() {
  const numLabels = await workerDB.label.count();
  const model = modelFactory(numLabels);
  const data = await tfDataLoader();
  console.log(data);
  await model.fit(data.featuresTensor, data.labelMaskTensor, {
    callbacks: { onBatchEnd },
    epochs: 200,
    batchSize: 32,
  });
  return { model, labelsToId: data.labelsToId, idsToLabel: data.idsToLabel };
}
function predictOne(
  model: tf.Sequential,
  example: Data.Vector,
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
  const unlabeledExamples = await workerDB.vector
    // .where("hasLabel")
    // .equals(-1)
    .limit(200)
    .toArray();
  const results = tf.tidy(() => {
    const results = unlabeledExamples.map((x) =>
      predictOne(model, x, idsToLabel)
    );
    return results;
  });

  return results;
}
