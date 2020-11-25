import React, { FunctionComponent } from "react";
import TextField from "@material-ui/core/TextField";
import debounce from "@material-ui/core/utils/debounce";
import searchSlice from "../../QueryContext/searchReducer";
import { useTypedSelector } from "../../redux-state/rootState";
import useSearchQuery from "../../QueryContext/useSearchQuery";
import { useDispatch } from "react-redux";
import FilterCheckboxes from "./FilterCheckboxes";
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
  const [value, setValue] = React.useState<string | undefined>(
    query || undefined
  );
  const exampleIds = useSearchQuery();
  const dispatch = useDispatch();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedUpdate = React.useCallback(
    debounce((e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
      dispatch(
        searchSlice.actions.setSearchParams({
          params: { searchQuery: e.target.value },
        })
      );
    }, 150),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  const handleChange = (
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    setValue(e.target.value);
    debouncedUpdate(e);
  };

  React.useEffect(() => {
    if (query) {
      setValue(query);
    }
  }, [query]);

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
          value={value}
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
