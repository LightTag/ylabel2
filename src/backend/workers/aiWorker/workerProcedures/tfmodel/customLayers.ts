import * as tf from "@tensorflow/tfjs";
import logger from "../../../../utils/logger";

function negativeLabelsCrossEntropy(
  labelMasks: tf.Tensor,
  predictedProbs: tf.Tensor
) {
  const maskedProbs = tf.mul(predictedProbs, labelMasks);
  const likelihoodOfUnrejected = tf.sum(maskedProbs, 1, true);
  const desiredProb = likelihoodOfUnrejected; //tf.sub(1, likelihoodOfUnrejected);
  const thingToMinimize = tf.mul(-1, tf.log(likelihoodOfUnrejected));

  const adjustmentFactor = tf.sum(maskedProbs, 1, true);
  const targets = tf.div(maskedProbs, adjustmentFactor);
  const negativeLogLikelihood = tf.mul(
    -1,
    tf.mul(targets, tf.log(tf.add(predictedProbs, 1e-9)))
  );
  const labelMaskSums = tf.sum(labelMasks, 1);
  const a = labelMasks.arraySync();
  const b = targets.arraySync();
  const c = predictedProbs.arraySync();
  logger({
    a,
    b,
    c,
    desiredProb: desiredProb.arraySync(),
    thingToMinimize: thingToMinimize.arraySync(),
  });
  const loss = tf.where(
    tf.equal(labelMaskSums, tf.onesLike(labelMaskSums)),
    tf.sum(negativeLogLikelihood, 1),
    thingToMinimize
  );

  return tf.mean(loss);
}

export default negativeLabelsCrossEntropy;
