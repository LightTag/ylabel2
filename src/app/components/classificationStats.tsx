import React, { FunctionComponent } from "react";
import { TextField } from "@material-ui/core";
import IconButton from "@material-ui/core/IconButton";
import SaveIcon from "@material-ui/icons/Save";
import { ClassBox } from "app/components/example/ClassificationRibbon";
import useDatabase from "app/database/useDatabase";
import { useMutation } from "react-query";
import { mainThreadDB } from "app/database/database";
import { useDispatch } from "react-redux";
import searchSlice from "app/QueryContext/searchReducer";
import { useTypedSelector } from "app/redux-state/rootState";
import FilterCheckboxes from "app/components/FilterCheckboxes";
import SelectedLabelToggle from "app/components/SelectedLabelToggle";
import Data from "app/data_clients/datainterfaces";
import useSearchQuery from "app/QueryContext/useSearchQuery";
import Button from "@material-ui/core/Button";
const AddLabel: FunctionComponent = () => {
  const [name, setName] = React.useState<string | undefined>();
  const addLabel = useMutation((name: string) =>
    mainThreadDB.label.add({ name, kind: "label", count: 0 }, name)
  );
  return (
    <div>
      <TextField
        label={"Add a new label"}
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <IconButton
        size={"small"}
        disabled={name === undefined}
        onClick={() => name && addLabel.mutate(name)}
      >
        <SaveIcon fontSize={"small"} />
      </IconButton>
    </div>
  );
};
const AnnotateAllButton: FunctionComponent<{ label: string }> = (props) => {
  const exampleIds = useSearchQuery();
  const classifyAll = useMutation(() =>
    mainThreadDB.transaction(
      "rw",
      [mainThreadDB.example, mainThreadDB.tfidf, mainThreadDB.vector],
      async () => {
        const labelState: Data.LabelState = {
          label: props.label || undefined,
          hasLabel: props.label !== null ? 1 : -1,
        };
        await Promise.all(
          (exampleIds.data || []).map(async (exampleId) => {
            Promise.all([
              mainThreadDB.example.update(exampleId, labelState),
              mainThreadDB.tfidf.update(exampleId, labelState),
              mainThreadDB.vector.update(exampleId, labelState),
            ]);
          })
        );
      }
    )
  );
  return (
    <Button size={"small"} onClick={() => classifyAll.mutate()}>
      {`Label all ${exampleIds?.data?.length || 0} examples as ${props.label}`}
    </Button>
  );
};
const ClassificationStats: FunctionComponent = (props) => {
  const labels = useDatabase(
    "labelStats",
    "label",
    (db) => db.label.toArray(),
    undefined
  );
  const dispatch = useDispatch();
  const selectedPrediction = useTypedSelector(
    (state) => state.searchReducer.predictedLabel
  );
  const handleClick = (labelName: string | null) =>
    dispatch(
      searchSlice.actions.setSearchParams({
        params: { predictedLabel: labelName },
      })
    );
  if (!labels.data) {
    return <div>loading</div>;
  }
  return (
    <div>
      <AddLabel />

      <ul>
        {labels.data.map((label, count) => (
          <div key={label.name} style={{ padding: "0.5rem" }}>
            <AnnotateAllButton label={label.name} />
            <ClassBox
              labelName={label.name}
              comment={`${label.count}`}
              selected={label.name === selectedPrediction}
              key={label.name}
              onClick={handleClick}
            />
            <SelectedLabelToggle labelName={label.name} />
          </div>
        ))}
      </ul>
      <FilterCheckboxes />
    </div>
  );
};

export default ClassificationStats;
