import { SVM } from "libsvm-ts";
import zip from "lodash/zip";
import shuffle from "lodash/shuffle";
import { AnalyticsData } from "../../data_clients/datainterfaces";

class LabelAccumulator {
  labelNum: number;
  seen: number;
  truePositive: number;
  falsePositive: number;
  falseNegative: number;

  constructor(labelNum: number) {
    this.labelNum = labelNum;
    this.seen = 0;
    this.truePositive = 0;
    this.falsePositive = 0;
    this.falseNegative = 0;
  }

  predictionCount() {
    return this.truePositive + this.falsePositive;
  }

  precision() {
    if (this.predictionCount() === 0) {
      return null;
    } else {
      return this.truePositive / (this.truePositive + this.falsePositive);
    }
  }

  recall() {
    return this.truePositive / this.seen;
  }

  f1() {
    const p = this.precision() || 0;
    const r = this.recall();
    return (2 * (p * r)) / (p + r);
  }

  addObservation(truth: number, pred: number) {
    if (truth !== this.labelNum && pred !== this.labelNum) {
      return;
    }
    if (truth === pred) {
      this.seen++;
      this.truePositive += 1;
      return;
    }
    if (truth === this.labelNum) {
      this.seen++;
      this.falseNegative += 1;
    }
    if (pred === this.labelNum) {
      this.falsePositive += 1;
    }
  }

  toRecord(params: {
    kNumber: number;
    timestamp: Date;
    idToLabelMap: Record<number, string>;
  }): AnalyticsData.PrecisionRecallKfoldMetric {
    return {
      label: params.idToLabelMap[this.labelNum],
      truePositive: this.truePositive,
      falsePositive: this.falsePositive,
      falseNegative: this.falseNegative,
      size: this.seen,
      f1: this.f1(),
      kNumber: params.kNumber,
      precision: this.precision(),
      recall: this.recall(),
      timestamp: params.timestamp,
    };
  }
}

class SVMTrainer {
  model: SVM;
  loaded: boolean;
  timestamp?: Date; // We might use this to index the runs
  constructor(
    type: string = "C_SVC",
    kernel: string = "LINEAR",
    cost: number = 15,
    gamma = 0.000000001
  ) {
    //TODO this can cause a memory leak because we need to free the model at same point (WASM has heap memory that js dosnt garbage collect)
    this.model = new SVM({
      // Having trouble tuning these ? Look at the outputs and then read https://www.csie.ntu.edu.tw/~cjlin/libsvm/faq.html#f427
      type,
      kernel,
      cost,
      gamma,
      probabilityEstimates: true,
    });
    this.loaded = false;
  }

  async init() {
    if (this.loaded) {
      return Promise.resolve();
    } else {
      //@ts-ignore loaded is private
      if (this.model.loaded) {
        //We already have the wasm
        this.loaded = true;
        return Promise.resolve();
      }
      return this.model.loadWASM();
    }
  }

  async trainOnce(data: [number[], number][]) {
    const trainFormat: { samples: number[][]; labels: number[] } = {
      samples: [],
      labels: [],
    };
    data.forEach(([sample, label]) => {
      trainFormat.samples.push(sample);
      trainFormat.labels.push(label);
    });
    this.model.train(trainFormat);
  }

  async *kFoldEvaluate(
    samples: number[][],
    labels: number[],
    k: number,
    idToLabelMap: Record<number, string>
  ): AsyncGenerator<AnalyticsData.PrecisionRecallKfoldMetric[], undefined> {
    /*
            Generally this whole function is very bad code
             */
    this.timestamp = new Date();
    const testSize = Math.max(
      Math.floor((1 / k) * Math.floor(samples.length)),
      Math.floor(samples.length / 2)
    ); // If we don't have enough data take half of it
    const trainSize = samples.length - testSize;
    //Zip the data together so we can shuffle them together
    const zippedData = zip(samples, labels);
    for (let i = 0; i < k; i++) {
      //Suffle for each fold
      const shufffledData = shuffle(zippedData) as [number[], number][];
      //get a train and test split from the suffled data
      const trainSet = shufffledData.slice(0, trainSize);
      const testSet = shufffledData.slice(trainSize);
      // Run training
      this.trainOnce(trainSet);
      //Get the predictions on the test set
      const testSetPredictions = await Promise.all(
        testSet.map(async (sampleWithLabel) => ({
          truth: sampleWithLabel[1],
          pred: await this.model.predictOne({ sample: sampleWithLabel[0] }),
        }))
      );
      // Calculate the report
      const precisionRecallReport = await this.precisionRecallReport(
        testSetPredictions.map((x) => x.truth),
        testSetPredictions.map((x) => x.pred)
      );
      yield precisionRecallReport.map((x) =>
        x.toRecord({
          kNumber: i,
          timestamp: this.timestamp as Date,
          idToLabelMap,
        })
      );
    }
    return;
  }

  async precisionRecallReport(truths: number[], preds: number[]) {
    const numLabels = Math.max(...truths, ...preds);
    const resultArr: LabelAccumulator[] = [];
    for (let i = 0; i <= numLabels; i++) {
      resultArr.push(new LabelAccumulator(i));
    }
    truths.forEach((truth, ix) => {
      const pred = preds[ix];
      try {
        if (truth === pred) {
          resultArr[truth].addObservation(truth, pred);
        } else {
          resultArr[truth].addObservation(truth, pred); // Add a false negative here
          resultArr[pred].addObservation(truth, pred); // And a false positive here
        }
      } catch (ex) {}
    });
    return resultArr;
  }
}

export default SVMTrainer;
