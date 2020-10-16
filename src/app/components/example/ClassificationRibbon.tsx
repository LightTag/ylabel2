import React, { FunctionComponent } from "react";

import makeStyles from "@material-ui/core/styles/makeStyles";
import colorManaer from "app/utils/labelsetcolors/labelsetcolors";
import useDatabase from "app/database/useDatabase";
import { useMutation } from "react-query";
import { mainThreadDB } from "app/database/database";
import Data from "app/data_clients/datainterfaces";

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
export const ClassBox: FunctionComponent<{
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

  const handleClick = (e: React.MouseEvent) => {
    if (!props.onClick) {
      return;
    }
    if (props.selected) {
      props.onClick(null);
    } else {
      props.onClick(labelName);
    }
  };
  return (
    <div style={style} className={classes.cbRoot} onClick={handleClick}>
      {labelName} {props.comment ? ` - ${props.comment}` : null}
    </div>
  );
});
const ClassificationRibbon: FunctionComponent<Props> = React.memo((props) => {
  const { exampleId } = props;

  const labels = useDatabase("labels", "label", (db) => db.label.toArray());
  const example = useDatabase(["exampleLabel", exampleId], "example", (db) =>
    db.example.where("exampleId").equals(exampleId).first()
  );
  const classify = useMutation((labelName: string | null) =>
    mainThreadDB.transaction(
      "rw",
      [mainThreadDB.example, mainThreadDB.tfidf],
      async () => {
        const labelState: Data.LabelState = {
          label: labelName || undefined,
          hasLabel: labelName !== null ? 1 : -1,
        };

        mainThreadDB.example.update(exampleId, labelState);
        mainThreadDB.tfidf.update(exampleId, labelState);
        mainThreadDB.vector.update(exampleId, labelState);
      }
    )
  );
  if (labels.data && example.data)
    return (
      <div>
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