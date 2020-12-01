import React, { FunctionComponent } from "react";
import Typography from "@material-ui/core/Typography";
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
import makeStyles from "@material-ui/core/styles/makeStyles";

const WelcomeItem: FunctionComponent<{
  title: string;
  subtitle: string;
  Icon?: typeof CategoryIcon;
}> = (props) => (
  <Grid item xs={6} md={3}>
    <Paper style={{ padding: "1rem", height: "100%" }}>
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
  return (
    <Grid
      container
      spacing={4}
      style={{ padding: "2rem", margin: "-16px -32px" }}
    >
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
    </Grid>
  );
};
const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
  },
  header: {
    width: "fit-content",
    padding: theme.spacing(2),
    margin: "auto",
  },
  subheader: {
    fontSize: "16px",
    width: "20rem",
    margin: "auto",
    marginTop: theme.spacing(2),
  },
  startButton: {
    width: "fit-content",
    padding: theme.spacing(2),
    margin: "auto",
    [theme.breakpoints.up("sm")]: {
      marginBottom: theme.spacing(4),
    },
  },
}));
const WelcomeLayout: FunctionComponent = () => {
  const [openDialog, setOpen] = React.useState<boolean>(false);
  const classes = useStyles();
  return (
    <div className={classes.root}>
      <div className={classes.header}>
        <Typography color="primary" variant={"h2"}>
          Welcome To YLabel
        </Typography>
        <Typography
          color="primary"
          variant={"body1"}
          className={classes.subheader}
        >
          A free and open source tool for document categorization from the
          makers of LightTag
        </Typography>
      </div>
      <div className={classes.startButton}>
        <Button
          variant={"contained"}
          color={"primary"}
          onClick={() => setOpen(true)}
        >
          <Typography align="center" variant={"h4"}>
            Start Categorizing
          </Typography>
        </Button>
      </div>

      <WelcomeText />

      <AddDataDialog open={openDialog} onClose={() => setOpen(false)} />
    </div>
  );
};

export default WelcomeLayout;
