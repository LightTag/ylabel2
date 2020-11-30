import React, { FunctionComponent } from "react";
import Typography from "@material-ui/core/Typography";
import ThreeColumnBody from "./templates/ThreeColumnBody";
import { Paper } from "@material-ui/core";
import ComputerIcon from "@material-ui/icons/Computer";
import CategoryIcon from "@material-ui/icons/Category";
import DescriptionIcon from "@material-ui/icons/Description";
import SearchIcon from "@material-ui/icons/Search";
import DoneIcon from "@material-ui/icons/GetApp";
import LockIcon from "@material-ui/icons/Lock";
import GithubIcon from "@material-ui/icons/GitHub";

import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import AddDataDialog from "../dataUpload/AddDataDialog";
const WelcomeItem: FunctionComponent<{
  title: string;
  subtitle: string;
  Icon?: typeof CategoryIcon;
}> = (props) => (
  <Grid item xs={6}>
    <Paper style={{ padding: "1rem" }}>
      <Grid
        container
        alignItems={"center"}
        spacing={2}
        justify={"space-between"}
      >
        <Grid item xs={1}>
          {props.Icon ? <props.Icon fontSize={"large"} /> : null}
        </Grid>
        <Grid item xs={10}>
          <Typography variant={"h4"}>{props.title}</Typography>
        </Grid>

        <Grid item xs={12}>
          <label style={{ fontSize: "16px" }}>{props.subtitle} </label>
        </Grid>
      </Grid>
    </Paper>
  </Grid>
);
const WelcomeText: FunctionComponent = () => {
  const [openDialog, setOpen] = React.useState<boolean>(false);
  return (
    <Grid
      container
      spacing={4}
      style={{ padding: "2rem", margin: "-16px -32px" }}
    >
      <Grid item xs={6}>
        <Typography color="primary" variant={"h3"}>
          Welcome To YLabel
        </Typography>
      </Grid>
      <Grid item xs={6}>
        <Button
          variant={"contained"}
          color={"primary"}
          fullWidth={true}
          onClick={() => setOpen(true)}
        >
          <Typography align="center" variant={"h4"}>
            Start Categorizing
          </Typography>
        </Button>
      </Grid>
      <WelcomeItem
        title={"Categorize Documents"}
        subtitle={"YLabel can help you categorize documents"}
        Icon={CategoryIcon}
      />
      <WelcomeItem
        title={"Customizable"}
        subtitle={"YLabel works on your data and your categories. "}
        Icon={DescriptionIcon}
      />
      <WelcomeItem
        title={"Search"}
        subtitle={"Use the search bar to find similar documents at once"}
        Icon={SearchIcon}
      />
      <WelcomeItem
        title={"Automation"}
        subtitle={"YLabel learns from you and provides predictions"}
        Icon={ComputerIcon}
      />
      <WelcomeItem
        title={"Active Learning"}
        subtitle={
          "YLabel can tell you what to label so that it can learn faster and automate better"
        }
        Icon={ComputerIcon}
      />
      <WelcomeItem
        title={"Download"}
        subtitle={
          "When you're done, click download to get back your labels and model predictions in a CSV"
        }
        Icon={DoneIcon}
      />
      <WelcomeItem
        title={"Secure"}
        subtitle={
          "Your data never leaves your computer. YLabel runs the machine learning and search on your machine. "
        }
        Icon={LockIcon}
      />
      <WelcomeItem
        title={"Open Source"}
        subtitle={
          "YLabel is free and open source. Fork the repo, extend it and help the community make it even better"
        }
        Icon={GithubIcon}
      />
      <AddDataDialog open={openDialog} onClose={() => setOpen(false)} />
    </Grid>
  );
};

const WelcomeLayout: FunctionComponent = () => {
  return (
    <ThreeColumnBody
      Middle={<WelcomeText />}
      Left={<div></div>}
      Right={<div></div>}
    />
  );
};

export default WelcomeLayout;
