import fileDownload from "js-file-download";
import { mainThreadDB } from "../../../backend/database/database";
import * as Papa from "papaparse";
import React, { FunctionComponent } from "react";
import { useMutation } from "react-query";
import { Button } from "@material-ui/core";
async function downloadResults() {
  const examples = await mainThreadDB.example
    .orderBy(["hasPrediction", "hasLabel"])
    .reverse()
    .toArray();
  const example = examples[0];
  const metaDataKeys = Object.keys(example.metadata || {});
  const columns = [
    "exampleId",
    "content",
    "label",
    "predictedLabel",
    "confidence",
    ...metaDataKeys,
  ];
  const formatedExamples = examples.map((ex) => ({
    ...ex,
    ...(ex.metadata || {}),
  }));
  const csv = Papa.unparse({ fields: columns, data: formatedExamples });
  fileDownload(csv, "ylabalResults.csv", "text/csv");
}

const DownloadButton: FunctionComponent = () => {
  const [downloadFunc, downloadStatus] = useMutation(downloadResults);
  return (
    <Button
      variant="contained"
      color={"primary"}
      onClick={() => downloadFunc()}
      disabled={downloadStatus.isLoading}
    >
      Download
    </Button>
  );
};

export default DownloadButton;
