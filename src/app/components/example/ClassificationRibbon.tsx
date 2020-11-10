import React, { FunctionComponent } from "react";

import makeStyles from "@material-ui/core/styles/makeStyles";
import colorManaer from "app/utils/labelsetcolors/labelsetcolors";
import useDatabase from "app/database/useDatabase";
import { useMutation } from "react-query";
import { mainThreadDB } from "app/database/database";
import Data from "app/data_clients/datainterfaces";
import AIWorkerSingleton from "app/workers/aiWorker/AIWorkerSingleton";

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
  const classify = useMutation((labelName: string | null) =>
    mainThreadDB.transaction(
      "rw",
      [mainThreadDB.example, mainThreadDB.tfidf, mainThreadDB.vector],
      async () => {
        const labelState: Partial<Data.LabelState> = {
          label: labelName || undefined,
          hasLabel: labelName !== null ? 1 : -1,
          hasNegativeOrRejectedLabel:
            labelName || (example.data?.rejectedLabels || []).length > 0
              ? 1
              : -1,
        };

        await mainThreadDB.example.update(exampleId, labelState);
        await mainThreadDB.tfidf.update(exampleId, labelState);
        await mainThreadDB.vector.update(exampleId, labelState);
      }
    )
  );
  if (labels.data && example.data)
    return (
      <div tabIndex={0}>
        {labels.data.map((label) => (
          <ClassBox
            labelName={label.name}
            selected={example?.data?.label == label.name}
            onClick={classify.mutate}
          />
        ))}
      </div>
    );
  else {
    return null;
  }
});

export default ClassificationRibbon;
