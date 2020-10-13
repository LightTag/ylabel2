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
  }
  interface Tag extends Base {
    name: string;
    kind: "tag";
  }
  interface Label extends Base {
    name: string;
    kind: "label";
  }
}

export default Data;
