import React, { FunctionComponent } from "react";
import TextField from "@material-ui/core/TextField";
import debounce from "@material-ui/core/utils/debounce";
import searchSlice from "app/QueryContext/searchReducer";
import { useTypedSelector } from "app/redux-state/rootState";
import useSearchQuery from "app/QueryContext/useSearchQuery";
import { useDispatch } from "react-redux";
import FilterCheckboxes from "app/components/searchBar/FilterCheckboxes";
import { LinearProgress } from "@material-ui/core";
import makeStyles from "@material-ui/core/styles/makeStyles";
const useStyles = makeStyles((theme) => ({
  root: {
    display: "inline",
    width: "100%",
    boxShadow: "4px 4px 4px #CDCDCD ",
    paddingBottom: "2.5rem",
  },
  searchBarContainer: {
    width: "50%",
    display: "inline",
  },
  filterContainer: {
    display: "inline",
  },
}));
const SearchBar: FunctionComponent = () => {
  const classes = useStyles();
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
    <div className={classes.root}>
      <div className={classes.searchBarContainer}>
        <TextField
          fullWidth={false}
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
      </div>
      <FilterCheckboxes />
    </div>
  );
};
export default SearchBar;
