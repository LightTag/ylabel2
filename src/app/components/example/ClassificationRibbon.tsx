import React, { FunctionComponent } from "react";
import { useDispatch, useSelector } from "react-redux";
import classificationSelectors from "../../redux-state/classification/classificationSelectors";
import { classificationActions } from "../../redux-state/classification/classificationReducer";

import makeStyles from "@material-ui/core/styles/makeStyles";
import colorManaer from "app/utils/labelsetcolors/labelsetcolors";

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
}> = (props) => {
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
};
const ClassificationRibbon: FunctionComponent<Props> = (props) => {
  const { exampleId } = props;
  const dispatch = useDispatch();
  const labels = useSelector(classificationSelectors.selectLabelArray);
  const currentClass = classificationSelectors.useSelectExampleClassification(
    exampleId
  );
  const classify = React.useCallback(
    (labelName: string | null) => {
      dispatch(classificationActions.classify({ exampleId, labelName }));
    },
    [labels, dispatch, exampleId]
  );

  return (
    <div>
      {labels.map((labelName) => (
        <ClassBox
          labelName={labelName}
          selected={currentClass == labelName}
          onClick={classify}
        />
      ))}
    </div>
  );
};

export default ClassificationRibbon;
