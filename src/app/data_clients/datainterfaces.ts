declare namespace Data {
  type resource =
    | "dataset"
    | "tagset"
    | "labelset"
    | "tag"
    | "label"
    | "example";
  interface Base {
    kind: resource;
  }
  interface SerializedIndex {
    name: string;
    data: Uint8Array;
  }
  interface Dataset extends Base {
    name: string;
    kind: "dataset";
  }
  interface TagSet extends Base {
    name: string;
    colorize?: () => void;
    kind: "tagset";
  }
  interface LabelSet extends Base {
    name: string;
    colorize?: () => void;
    kind: "labelset";
  }
  interface Example extends Base {
    exampleId: string | number;
    content: string;
    metadata?: any;
    datasetName?: string;
    kind: "example";
    label?: string;
    hasLabel: -1 | 1; //Indexdb won't index bools so we use 1 for labeled and -1 for not labeled
  }
  interface Tag extends Base {
    name: string;
    kind: "tag";
  }
  interface Label extends Base {
    name: string;
    kind: "label";
    count: number;
  }
  interface Vector {
    exampleId: string;
    vector: number[];
    label?: string; // The label applied to the example
    hasLabel: -1 | 1; //Indexdb won't index bools so we use 1 for labeled and -1 for not labeled
  }
  type TFIDF = { exampleId: string; size: number } | Record<string, number>;
}

export default Data;
