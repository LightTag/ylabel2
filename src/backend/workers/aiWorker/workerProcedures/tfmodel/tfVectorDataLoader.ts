import { workerDB } from "../../../../database/database";
import Data from "../../../..//data_clients/datainterfaces";
import * as tf from "@tensorflow/tfjs";
import logger from "../../../../utils/logger";

function makeLabelMask(
  trueLabel: number | undefined,
  falseLabels: number[] | undefined,
  numLabels: number
) {
  const negativeMask = Array(numLabels).fill(1);
  const positiveMask = Array(numLabels).fill(0);
  if (trueLabel !== undefined) {
    positiveMask[trueLabel] = 1;
    return positiveMask;
  }
  if (falseLabels === undefined) {
    throw new Error(
      "You need to provide a true label or an array of false labels"
    );
  } else {
    falseLabels.forEach((falseLabelIx) => {
      negativeMask[falseLabelIx] = 0;
    });

    logger("neg", negativeMask);
    return negativeMask;
  }
}

async function getLabelsDict() {
  const labelsToId: Record<string, number> = {};
  const idsToLabel: Record<number, string> = {};
  const labels = await workerDB.label.toArray();
  labels.forEach((label, num) => {
    labelsToId[label.name] = num;
    idsToLabel[num] = label.name;
  });

  const numLables = labels.length;
  return { labelsToId, idsToLabel, numLables };
}

async function tfVectorDataLoader() {
  const labeledTFIDFArray = (await workerDB.vector
    .where("hasNegativeOrRejectedLabel")
    .equals(1)
    .toArray()) as Required<Data.Vector>[];
  const featuresArr: number[][] = [];
  const labelMaskArr: number[][] = [];
  const { labelsToId, idsToLabel, numLables } = await getLabelsDict();

  labeledTFIDFArray.forEach((item) => {
    featuresArr.push(item.vector);
    labelMaskArr.push(
      makeLabelMask(
        labelsToId[item.label],
        item.rejectedLabels.map((x) => labelsToId[x]),
        numLables
      )
    );
  });
  return {
    featuresTensor: tf.tensor(featuresArr, undefined, "float32"),
    labelMaskTensor: tf.tensor(labelMaskArr, undefined, "int32"),
    labelsToId,
    idsToLabel,
  };
}

export async function tfTFIDFDataLoader() {
  const labeledTFIDFArray = (await workerDB.tfidf
    .where("hasLabel")
    .equals(1)
    .toArray()) as Required<Data.TFIDF>[];
  const featuresArr: number[][] = [];
  const labelMaskArr: number[][] = [];
  const { labelsToId, idsToLabel, numLables } = await getLabelsDict();

  labeledTFIDFArray.forEach((item) => {
    featuresArr.push(item.arr);
    labelMaskArr.push(
      makeLabelMask(
        labelsToId[item.label],
        item.rejectedLabels.map((x) => labelsToId[x]),
        numLables
      )
    );
  });
  return {
    featuresTensor: tf.tensor(featuresArr, undefined, "float32"),
    labelMaskTensor: tf.tensor(labelMaskArr, undefined, "int32"),
    labelsToId,
    idsToLabel,
  };
}

export default tfVectorDataLoader;
