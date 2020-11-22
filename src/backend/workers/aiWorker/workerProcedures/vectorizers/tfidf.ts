import Data from "../../../../data_clients/datainterfaces";

export class Counter {
  items: Record<string, number>;
  constructor() {
    this.items = {};
  }
  get(key: string) {
    return this.items[key] || 0;
  }
  increment(key: string) {
    const val = this.get(key);
    this.items[key] = val + 1;
  }
}
export const tokenizingRegex = /[\b\s-.,!&:]+(?!$)/;
export type TFIDFT = Record<string, Record<string, number>>;

function doExample(example: Data.Example) {
  const tf = new Counter();
  const df = new Set<string>();

  example.content.split(tokenizingRegex).forEach((word) => {
    if (!word.match(/[\d]/)) {
      tf.increment(word);
      df.add(word);
    }
  });
  return { df, tf };
}
function calculateTFIDF(examples: Data.Example[], minDF = 4) {
  const tf: Record<string, Counter> = {};
  const df = new Counter();
  examples.forEach((example) => {
    //Calculate the df

    const ex_res = doExample(example);
    ex_res.df.forEach((word) => {
      df.increment(word);
    });
    tf[example.exampleId] = ex_res.tf;
  });
  const tfIdf: TFIDFT = {};
  examples.forEach((example) => {
    tfIdf[example.exampleId] = {};

    Object.keys(df.items).forEach((word) => {
      if (df.get(word) > minDF) {
        tfIdf[example.exampleId][word] = Math.log1p(
          tf[example.exampleId].get(word) / df.get(word)
        );
      }
    });
  });
  return { tfIdf, df };
}

class TFIDFTransformer {
  df: Counter;
  constructor() {
    this.df = new Counter();
  }
  fitTransform(examples: Data.Example[]) {
    const { tfIdf, df } = calculateTFIDF(examples);
    this.df = df;
    return tfIdf;
  }
  transform(examples: Data.Example[]) {
    const tfIdf: TFIDFT = {};
    const tf: Record<string, Counter> = {};

    examples.forEach((example) => {
      //Calculate the df
      const ex_res = doExample(example);
      tf[example.exampleId] = ex_res.tf;
    });

    examples.forEach((example) => {
      tfIdf[example.exampleId] = {};
      Object.keys(this.df.items).forEach((word) => {
        tfIdf[example.exampleId][word] = Math.log1p(
          tf[example.exampleId].get(word) / this.df.get(word)
        );
      });
    });
  }
}

export default TFIDFTransformer;
