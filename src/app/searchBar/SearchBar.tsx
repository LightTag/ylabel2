import React, { FunctionComponent } from "react";
import TextField from "@material-ui/core/TextField";
import debounce from "@material-ui/core/utils/debounce";
import searchSlice from "app/QueryContext/searchReducer";
import { useTypedSelector } from "app/redux-state/rootState";
import useSearchQuery from "app/QueryContext/useSearchQuery";
import { useDispatch } from "react-redux";
import FilterCheckboxes from "app/components/FilterCheckboxes";
import { LinearProgress } from "@material-ui/core";
const SearchBar: FunctionComponent = () => {
  const query = useTypedSelector((state) => state.searchReducer.searchQuery);
  const exampleIds = useSearchQuery();
  const dispatch = useDispatch();
  const handleChange = debounce((e) => {
    dispatch(
      searchSlice.actions.setSearchParams({
        params: { searchQuery: e.target.value },
      })
    );
  }, 50);

  return (
    <div>
      <TextField
        fullWidth={true}
        variant={"outlined"}
        onChange={(e) => {
          e.persist();
          handleChange(e);
        }}
        defaultValue={query}
        helperText={
          exampleIds.isLoading ? (
            <LinearProgress variant={"indeterminate"} />
          ) : (
            `${exampleIds.data?.length || 0} items`
          )
        }
      />
      <FilterCheckboxes />
    </div>
  );
};
export default SearchBar;
