import React, { ChangeEvent } from "react";
import { FunctionComponent } from "react";
import { useDispatch, useSelector } from "react-redux";
import classificationSelectors from "../../redux-state/classification/classificationSelectors";
import { classificationActions } from "../../redux-state/classification/classificationReducer";
import Autocomplete, {
  createFilterOptions,
} from "@material-ui/lab/Autocomplete";
import { TextField } from "@material-ui/core";

interface Props {
  exampleId: string;
}
const filter = createFilterOptions<string>();

const ClassificationSelect: FunctionComponent<Props> = (props) => {
  const { exampleId } = props;
  const dispatch = useDispatch();
  const labels = useSelector(classificationSelectors.selectLabelArray);
  const currentClass = classificationSelectors.useSelectExampleClassification(
    exampleId
  );
  const classify = React.useCallback(
    (e: ChangeEvent<{}>, labelName: string | null) => {
      if (labelName !== null && !labels.includes(labelName)) {
        dispatch(
          classificationActions.addLabel({
            name: labelName.replace("Add ", "").replace('"', ""),
          })
        );
      }
      dispatch(classificationActions.classify({ exampleId, labelName }));
    },
    [labels, dispatch, exampleId]
  );

  return (
    <Autocomplete
      tabIndex={1}
      openOnFocus={true}
      options={labels}
      renderInput={(params) => (
        <TextField {...params} label="Classify" variant="outlined" />
      )}
      value={currentClass}
      onChange={classify}
      freeSolo={true}
      selectOnFocus={true}
      clearOnBlur={true}
      handleHomeEndKeys={true}
      filterOptions={(options, params) => {
        const filtered = filter(options, params);

        // Suggest the creation of a new value
        if (params.inputValue !== "") {
          filtered.push(`Add "${params.inputValue}"`);
        }

        return filtered;
      }}
    />
  );
};

export default ClassificationSelect;
