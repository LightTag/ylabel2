import React, { FunctionComponent } from "react";

import { makeStyles } from "@material-ui/core/styles";
import { Paper } from "@material-ui/core";
import LabselsetColors from "../../utils/labelsetcolors/labelsetcolors";
import ClassificationRibbon from "./ClassificationRibbon";

import Typography from "@material-ui/core/Typography";
import useDatabase from "../../../backend/database/useDatabase";
import { ActiveLearningContext } from "../../active_learning/ActiveLearningContext";
import { rejectLabel } from "../../../backend/database/dbProcesdures";
import Divider from "@material-ui/core/Divider";

interface Props {
  exampleId: string;
  score?: number;
  addSpanId?: (spanId: string) => void;
  onLoad?: () => void;
}

const useStyles = makeStyles((theme) => ({
  root: {
    boxShadow: "4px 4px 4px #CDCDCD ",
    margin: theme.spacing(3),
    padding: theme.spacing(3),
    lineHeight: "2.5rem",
  },
  body: {
    whiteSpace: "pre-wrap",
    fontSize: "16px",
    lineHeight: "32px",
  },
  divider: {
    margin: theme.spacing(2, 0),
  },
  ribbon: {
    height: "15%",
  },
}));

const Example: FunctionComponent<Props> = (props) => {
  const classes = useStyles();
  const exampleQuery = useDatabase(
    ["example", props.exampleId],
    "example",
    (db) => db.example.get(props.exampleId),
    props.exampleId
  );
  const activeLearningContext = React.useContext(ActiveLearningContext);
  React.useEffect(() => {
    props.onLoad && props.onLoad();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exampleQuery.data]);
  if (exampleQuery.data) {
    return (
      <Paper
        className={classes.root}
        style={{
          border: exampleQuery.data?.predictedLabel
            ? `1px solid ${LabselsetColors.getLabelColor(
                exampleQuery.data.predictedLabel
              )}`
            : undefined,
        }}
      >
        <div className={classes.ribbon}>
          <Typography variant={"subtitle1"} color={"primary"}>
            {props.score || null}
          </Typography>
          <ClassificationRibbon exampleId={props.exampleId} />
        </div>
        <Divider className={classes.divider} />
        <div
          style={{ fontWeight: "bold" }}
          onClick={() => {
            if (exampleQuery.data && exampleQuery.data.predictedLabel) {
              rejectLabel(
                exampleQuery.data.exampleId,
                exampleQuery.data.predictedLabel
              );
              if (activeLearningContext) {
                activeLearningContext.goToNext();
              }
            }
          }}
        >
          {" "}
          {exampleQuery.data?.predictedLabel || null}{" "}
          {exampleQuery.data?.confidence?.toLocaleString("en", {
            style: "percent",
          }) || null}
        </div>
        <Typography className={classes.body} dir={"auto"}>
          {/*{annotationQuery.data.map((span) => (*/}
          {/*  <ExampleSpan*/}
          {/*    span={span}*/}
          {/*    key={span.start}*/}
          {/*    addSpanId={props.addSpanId}*/}
          {/*  />*/}
          {/*))}*/}

          {exampleQuery.data.content}
        </Typography>
      </Paper>
    );
  } else {
    return <div>HI</div>;
  }
};

export default Example;
