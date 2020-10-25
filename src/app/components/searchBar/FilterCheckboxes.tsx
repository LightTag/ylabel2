import React, { FunctionComponent } from "react";
import { useDispatch } from "react-redux";
import { FormGroup } from "@material-ui/core";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import { useTypedSelector } from "app/redux-state/rootState";
import searchSlice from "app/QueryContext/searchReducer";
import makeStyles from "@material-ui/core/styles/makeStyles";
const useStyles = makeStyles({
  root: {},
  icon: {
    borderRadius: 3,
    width: 16,
    height: 16,
  },
  checkedIcon: {},
});

const FilterCheckboxes: FunctionComponent = (props) => {
  const dispatch = useDispatch();
  const classes = useStyles();
  const state = useTypedSelector((state) => state.searchReducer);
  return (
    <FormGroup row style={{ display: "inline" }}>
      <FormControlLabel
        labelPlacement={"bottom"}
        control={
          <Checkbox
            checked={state.hasLabel === 1}
            onChange={(e, v) =>
              dispatch(
                searchSlice.actions.setSearchParams({
                  params: { hasLabel: v ? 1 : null },
                })
              )
            }
            value={state.hasLabel === 1}
          />
        }
        label={<span style={{ fontSize: "0.75rem" }}>Show Labeled</span>}
      />
      <FormControlLabel
        classes={classes}
        labelPlacement={"bottom"}
        control={
          <Checkbox
            size={"small"}
            style={{ fontSize: "0.5rem" }}
            checked={state.hasLabel === -1}
            onChange={(e, v) =>
              dispatch(
                searchSlice.actions.setSearchParams({
                  params: { hasLabel: v ? -1 : null },
                })
              )
            }
            value={state.hasLabel === -1}
          />
        }
        label={<span style={{ fontSize: "0.75rem" }}>Hide Labeled</span>}
      />

      <FormControlLabel
        labelPlacement={"bottom"}
        control={
          <Checkbox
            checked={state.hasPrediction === 1}
            onChange={(e, v) =>
              dispatch(
                searchSlice.actions.setSearchParams({
                  params: { hasPrediction: v ? 1 : null },
                })
              )
            }
            value={state.hasPrediction === 1}
          />
        }
        label={<span style={{ fontSize: "0.75rem" }}>Show Predicted</span>}
      />
      <FormControlLabel
        labelPlacement={"bottom"}
        control={
          <Checkbox
            checked={state.hasPrediction === -1}
            onChange={(e, v) =>
              dispatch(
                searchSlice.actions.setSearchParams({
                  params: { hasPrediction: v ? -1 : null },
                })
              )
            }
            value={state.hasPrediction === -1}
          />
        }
        label={<span style={{ fontSize: "0.75rem" }}>Hide Predicted</span>}
      />
    </FormGroup>
  );
};

export default FilterCheckboxes;
