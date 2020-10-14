import { SVM } from "libsvm-ts";
import { Counter, TFIDFT } from "./tfidf";

const svm = new SVM({
  type: "C_SVC",
  kernel: "RBF",
  gamma: 1,
  cost: 1,
});

function convertToTrainFormat(
  exampleTFIDF: TFIDFT,
  vocab: Counter,
  exampleLabels: Record<string, number>
) {
  const samples: number[][] = [];
  const labels: number[] = [];

  const sortedExampleIds = Object.keys(exampleTFIDF).sort();
  let firstWord = true;
  Object.keys(vocab.items).forEach((word) => {
    sortedExampleIds.forEach((exampleId, exampleIdIx) => {
      if (firstWord) {
        samples[exampleIdIx] = [exampleTFIDF[exampleId][word]];
      } else {
        samples[exampleIdIx].push(exampleTFIDF[exampleId][word]);
      }
      labels.push(exampleLabels[exampleId]);
    });
  });
  return { samples, labels };
}

//  0  1
async function trainSVM(
  exampleTFIDF: TFIDFT,
  exampleLabels: Record<string, number>,
  vocab: Counter
) {
  const { samples, labels } = convertToTrainFormat(
    exampleTFIDF,
    vocab,
    exampleLabels
  );
  const loadedSVM = await svm.loadWASM();
  loadedSVM.train({ samples, labels });
  return loadedSVM;
}

export default trainSVM;
