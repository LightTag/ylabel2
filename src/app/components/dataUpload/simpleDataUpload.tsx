import React, { FunctionComponent, SyntheticEvent } from "react";
import { Button, TextField } from "@material-ui/core";
import { readUserInputFile } from "./fileReader";
import MenuItem from "@material-ui/core/MenuItem";
import Data from "../../data_clients/datainterfaces";
import md5 from "crypto-js/md5";
import { useDispatch } from "react-redux";
import { addExamplesThunk } from "../../redux-state/examples/exampleState";

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
    <>
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
          fullWidth={false}
          variant={"contained"}
          component="span"
          color={"primary"}
        >
          Add File
        </Button>
      </label>
      {keys ? (
        <TextField
          onChange={(e) => setKey(e.target.value)}
          disabled={!keys}
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
      ) : null}
      <Button disabled={!key} onClick={handleSaveExamples}>
        Upload
      </Button>
    </>
  );
};

export default FileUploadButton;
