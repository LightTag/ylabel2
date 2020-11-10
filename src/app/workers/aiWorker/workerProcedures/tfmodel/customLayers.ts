import * as tf from "@tensorflow/tfjs";

function negativeLabelsCrossEntropy(
  labelMasks: tf.Tensor,
  predictedProbs: tf.Tensor
) {
  const adjustmentFactor = tf.sum(labelMasks, 1, true);
  const targets = tf.div(tf.mul(predictedProbs, labelMasks), adjustmentFactor);
  const negativeLogLikelihood = tf.mul(
    -1,
    tf.sum(tf.mul(targets, tf.log(tf.add(predictedProbs, 1e-9))))
  );
  const a = labelMasks.arraySync();
  const b = targets.arraySync();
  const c = predictedProbs.arraySync();
  console.log({ a, b, c });
  return negativeLogLikelihood;
}

export default negativeLabelsCrossEntropy;
