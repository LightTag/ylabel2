import React, { FunctionComponent } from "react";
import Typography from "@material-ui/core/Typography";
import FileUploadButton from "../dataUpload/simpleDataUpload";
import ThreeColumnBody from "./templates/ThreeColumnBody";
import { Paper } from "@material-ui/core";

const WelcomeBody: FunctionComponent = () => {
  return (
    <div style={{ width: "400px", margin: "auto" }}>
      <Typography variant={"h3"} gutterBottom>
        Hi! Welcome to YLabel
      </Typography>
      <Typography variant={"h5"} gutterBottom>
        YLabel helps you build natural language processing models.
      </Typography>
      <Typography variant={"h5"} gutterBottom>
        Everything happens in the browser and your data never leaves your
        computer
      </Typography>
      <Paper>
        <Typography variant={"h4"}>Add Data</Typography>

        <FileUploadButton />
      </Paper>
    </div>
  );
};

const WelcomeLayout: FunctionComponent = () => {
  return (
    <ThreeColumnBody
      Left={<div></div>}
      Middle={<WelcomeBody />}
      Right={<div></div>}
    />
  );
};

export default WelcomeLayout;
