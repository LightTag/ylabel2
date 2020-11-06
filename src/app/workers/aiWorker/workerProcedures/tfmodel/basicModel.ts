import * as tf from "@tensorflow/tfjs";
import negativeLabelsCrossEntropy from "app/workers/aiWorker/workerProcedures/tfmodel/customLayers";
import tfDataLoader from "app/workers/aiWorker/workerProcedures/tfmodel/tfDataLoader";
function modelFactory(numLabels: number) {
  const model = tf.sequential();
  model.add(
    tf.layers.dense({ units: 64, inputShape: [512], activation: "relu" })
  );
  model.add(tf.layers.dense({ units: 32, activation: "elu" }));
  model.add(tf.layers.dense({ units: numLabels, activation: "linear" }));
  model.add(tf.layers.softmax());
  model.compile({
    optimizer: "sgd",
    loss: negativeLabelsCrossEntropy,
    metrics: ["accuracy"],
  });

  return model;
}
//@ts-ignore
function onBatchEnd(batch, logs) {
  console.log("Accuracy", logs);
}

export async function trainTFModel() {
  const model = modelFactory(3);
  const data = await tfDataLoader();
  console.log(data);
  model.fit(data.featuresTensor, data.labelMaskTensor, {
    callbacks: { onBatchEnd },
    epochs: 50,
    batchSize: 32,
  });
}
