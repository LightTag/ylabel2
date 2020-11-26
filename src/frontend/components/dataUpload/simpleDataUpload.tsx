import React, { FunctionComponent, SyntheticEvent } from "react";
import { Button, TextField } from "@material-ui/core";
import { readUserInputFile } from "./fileReader";
import MenuItem from "@material-ui/core/MenuItem";
import md5 from "crypto-js/md5";
import { useDispatch } from "react-redux";
import { addExamplesThunk } from "../../redux-state/examples/exampleState";
import Data from "../../../backend/data_clients/datainterfaces";
import Grid from "@material-ui/core/Grid";

const FileUploadButton: FunctionComponent = () => {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [keys, setKeys] = React.useState<string[]>();
  const [key, setKey] = React.useState<string>();
  const [data, setData] = React.useState<any[]>();
  const dispatch = useDispatch();
  const handleSaveExamples = () => {
    const examplesArr: Data.Example[] = [];
    if (data && key) {
      data.forEach((ex) => {
        examplesArr.push({
          content: ex[key],

          datasetName: "test",
          exampleId: md5(ex[key]).toString(),
          label: ex["label"],
          hasLabel: ex["label"] ? 1 : -1,
          kind: "example",
          hasNegativeOrRejectedLabel: -1,
          rejectedLabels: [],
        });
      });
    }
    dispatch(addExamplesThunk(examplesArr));
  };
  const handleFile = async (e: SyntheticEvent) => {
    e.preventDefault();
    if (inputRef) {
      if (inputRef.current) {
        if (inputRef.current.files) {
          const file = inputRef.current.files[0];
          if (file) {
            const res = await readUserInputFile(inputRef.current.files[0]);
            setData(res);
            setKeys(Object.keys(res[0]));
          }
        }
      }
    }
  };
  return (
    <Grid container spacing={4}>
      <Grid item xs={12}>
        <input
          ref={inputRef}
          accept="text/csv, text/tsv, .csv,.tsv, .json"
          onChange={handleFile}
          style={{ display: "none" }}
          id="csv-file"
          multiple
          type="file"
        />
        <label htmlFor="csv-file">
          <Button
            fullWidth={true}
            variant={"outlined"}
            component="span"
            color={"primary"}
          >
            Add File
          </Button>
        </label>
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth={true}
          disabled={!keys}
          onChange={(e) => setKey(e.target.value)}
          select={true}
          label={"Text Field"}
          helperText={"Which Field will we label"}
          value={key}
        >
          {(keys || []).map((key) => (
            <MenuItem key={key} value={key}>
              {key}
            </MenuItem>
          ))}
        </TextField>
      </Grid>

      <Grid item xs={12}>
        <Button
          color={"primary"}
          variant={"contained"}
          disabled={!key}
          onClick={handleSaveExamples}
          fullWidth={true}
        >
          Upload
        </Button>
      </Grid>
    </Grid>
  );
};

export default FileUploadButton;
