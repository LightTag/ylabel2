import { workerDB } from "app/database/database";
import Data from "app/data_clients/datainterfaces";
import * as tf from "@tensorflow/tfjs";

function makeLabelMask(
  trueLabel: number | undefined,
  falseLabels: number[] | undefined,
  numLabels: number
) {
  const negativeMask = new Array(numLabels).fill(1);
  const positiveMask = new Array(numLabels).fill(0);
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
    return negativeMask;
  }
}
async function tfDataLoader() {
  const labeledTFIDFArray = (await workerDB.vector
    .where("hasNegativeOrRejectedLabel")
    .equals(1)
    .toArray()) as Required<Data.Vector>[];
  const featuresArr: number[][] = [];
  const labelMaskArr: number[][] = [];
  const labelsToId: Record<string, number> = {};
  const idsToLabel: Record<number, string> = {};
  const labelSet = new Set<string>();
  labeledTFIDFArray.forEach((item) => {
    item.rejectedLabels.forEach((rl) => {
      labelSet.add(rl);
    });
    if (item.label) {
      labelSet.add(item.label);
    }
  });
  const numLables = labelSet.size;
  Array.from(labelSet).forEach((label, num) => {
    labelsToId[label] = num;
    idsToLabel[num] = label;
  });
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

export default tfDataLoader;
