import * as tf from "@tensorflow/tfjs";

function negativeLabelsCrossEntropy(
  labelMasks: tf.Tensor,
  predictedProbs: tf.Tensor
) {
  const maskedProbs = tf.mul(predictedProbs, labelMasks);
  const adjustmentFactor = tf.sum(maskedProbs, 1, true);
  const targets = tf.div(maskedProbs, adjustmentFactor);
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
