import { workerDB } from "../../../../database/database";
import Data from "../../../..//data_clients/datainterfaces";
import * as tf from "@tensorflow/tfjs";

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
    console.log("neg", negativeMask);
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
  const labels = await workerDB.label.toArray();
  labels.forEach((label, num) => {
    labelsToId[label.name] = num;
    idsToLabel[num] = label.name;
  });

  const numLables = labels.length;

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
