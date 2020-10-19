import React, { FunctionComponent } from "react";
import { useDispatch } from "react-redux";
import { FormGroup } from "@material-ui/core";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import { useTypedSelector } from "app/redux-state/rootState";
import searchSlice from "app/QueryContext/searchReducer";
const FilterCheckboxes: FunctionComponent = (props) => {
  const dispatch = useDispatch();
  const state = useTypedSelector((state) => state.searchReducer);
  return (
    <FormGroup row>
      <FormControlLabel
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
        label="Show Labeled"
      />
      <FormControlLabel
        control={
          <Checkbox
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
        label="Hide Labeled"
      />

      <FormControlLabel
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
        label="Show Predicted"
      />
      <FormControlLabel
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
        label="Hide Predicted"
      />
    </FormGroup>
  );
};

export default FilterCheckboxes;
