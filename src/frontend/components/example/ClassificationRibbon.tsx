import React, { FunctionComponent } from "react";

import makeStyles from "@material-ui/core/styles/makeStyles";

import { ActiveLearningContext } from "../../active_learning/ActiveLearningContext";
import colorManaer from "../../utils/labelsetcolors/labelsetcolors";
import AIWorkerSingleton from "../../../backend/workers/aiWorker/AIWorkerSingleton";
import useDatabase from "../../../backend/database/useDatabase";
import { applyLabel } from "../../../backend/database/dbProcesdures";
import Data from "../../../backend/data_clients/datainterfaces";

interface Props {
  exampleId: string;
}

const useStyles = makeStyles((theme) => ({
  cbRoot: {
    display: "inline",
    width: "fit-content",
    maxWidth: "20%",
    textOverflow: "ellipsis",
    cursor: "pointer",
    padding: theme.spacing(1),
    marginRight: theme.spacing(1),
    borderRadius: "4px",
    fontWeight: "bold",
    userSelect: "none",
  },
}));
const ClassBox: FunctionComponent<{
  labelName: string;
  selected: boolean;
  onClick?: (val: string | null) => void;
  comment?: string;
}> = React.memo((props) => {
  const classes = useStyles();
  const labelName = props.labelName;
  const style = React.useMemo(() => {
    const color = colorManaer.getLabelColor(labelName);
    if (props.selected) {
      return {
        background: color,
        color: "white",
      };
    } else {
      return {
        borderColor: color,
        color: color,
        border: "1px solid",
      };
    }
  }, [labelName, props.selected]);

  const activeLearningContext = React.useContext(ActiveLearningContext);

  const handleClick = () => {
    if (!props.onClick) {
      return;
    }
    if (props.selected) {
      props.onClick(null);
    } else {
      props.onClick(labelName);
      const workerController = AIWorkerSingleton.getInstance();
      workerController.afterNewLabel();
      if (activeLearningContext) {
        activeLearningContext.goToNext();
      }
    }
  };
  return (
    <div
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.keyCode === 32) {
          handleClick();
          e.preventDefault();
        }
      }}
      style={style}
      className={classes.cbRoot}
      onClick={handleClick}
      tabIndex={0}
    >
      {labelName} {props.comment ? ` - ${props.comment}` : null}
    </div>
  );
});
const ClassificationRibbon: FunctionComponent<Props> = React.memo((props) => {
  const { exampleId } = props;

  const labels = useDatabase(
    "labels",
    "label",
    (db) => db.label.toArray(),
    undefined
  );
  const example = useDatabase(
    ["exampleLabel", exampleId],
    "example",
    (db) => db.example.where("exampleId").equals(exampleId).first(),
    props.exampleId
  );

  if (labels.data && example.data)
    return (
      <div tabIndex={0}>
        {labels.data.map((label) => (
          <span
            style={
              //@ts-ignore
              example.data.rejectedLabels.includes(label.name)
                ? { opacity: 0.3 }
                : {}
            }
          >
            <ClassBox
              labelName={label.name}
              selected={example?.data?.label === label.name}
              onClick={() =>
                applyLabel((example.data as Data.Example).exampleId, label.name)
              }
            />
          </span>
        ))}
      </div>
    );
  else {
    return null;
  }
});

export default ClassificationRibbon;
