import React, { FunctionComponent, SyntheticEvent } from "react";
import { Button, TextField } from "@material-ui/core";
import { readUserInputFile } from "./fileReader";
import MenuItem from "@material-ui/core/MenuItem";
import md5 from "crypto-js/md5";
import { addExamples } from "../../redux-state/examples/exampleState";
import Data from "../../../backend/data_clients/datainterfaces";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import { useMutation } from "react-query";
import Fade from "@material-ui/core/Fade";
import LinearProgress from "@material-ui/core/LinearProgress";

const saveExamplesfn = (params: {
  data: any[] | undefined;
  key: string | undefined;
  labelKey: string | undefined;
}) => {
  const { data, key, labelKey } = params;
  const examplesArr: Data.Example[] = [];
  if (data && key) {
    data.forEach((ex) => {
      const metadata = { ...ex };
      delete metadata[key];
      examplesArr.push({
        content: ex[key],

        datasetName: "test",
        exampleId: md5(ex[key]).toString(),
        label: labelKey ? ex[labelKey] : undefined,
        hasLabel: labelKey && ex[labelKey] ? 1 : -1,
        kind: "example",
        hasNegativeOrRejectedLabel: -1,
        rejectedLabels: [],
        metadata,
      });
    });
  }
  return addExamples(examplesArr);
};
const FileUploadButton: FunctionComponent<{
  afterSubmit?: () => void;
}> = (props) => {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [keys, setKeys] = React.useState<string[]>();
  const [key, setKey] = React.useState<string>();
  const [labelKey, setLabelKey] = React.useState<string | undefined>();
  const [data, setData] = React.useState<any[]>();
  const [saveExamples, saveStatus] = useMutation(saveExamplesfn);
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
            props.afterSubmit && props.afterSubmit();
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
            Add A CSV
          </Button>
        </label>
      </Grid>
      <Grid item xs={12}>
        <TextField
          required={true}
          fullWidth={true}
          disabled={!keys}
          onChange={(e) => setKey(e.target.value)}
          select={true}
          label={"Data Column"}
          helperText={"Which column will you be labeling? "}
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
        <TextField
          fullWidth={true}
          disabled={!key}
          onChange={(e) => setLabelKey(e.target.value)}
          select={true}
          label={"Label Column"}
          helperText={"Is there a column with labels?  "}
          value={key}
        >
          <MenuItem key={"empty"} value={undefined} disabled={false}>
            <Typography color={"error"}> No Labels </Typography>
          </MenuItem>
          {(keys || []).map((k) => (
            <MenuItem key={k} value={k} disabled={k === key}>
              {k}
            </MenuItem>
          ))}
        </TextField>
      </Grid>

      <Grid item xs={12}>
        <Button
          color={"primary"}
          variant={"contained"}
          disabled={!key || saveStatus.isLoading}
          onClick={() => saveExamples({ data, key, labelKey })}
          fullWidth={true}
        >
          <Fade in={!saveStatus.isLoading}>
            <span> Upload </span>
          </Fade>
        </Button>
        <Fade in={saveStatus.isLoading}>
          <LinearProgress />
        </Fade>
      </Grid>
    </Grid>
  );
};

export default FileUploadButton;
