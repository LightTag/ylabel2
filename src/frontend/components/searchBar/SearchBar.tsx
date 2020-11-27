import React, { FunctionComponent } from "react";
import debounce from "@material-ui/core/utils/debounce";
import searchSlice from "../../QueryContext/searchReducer";
import { useTypedSelector } from "../../redux-state/rootState";
import useSearchQuery from "../../QueryContext/useSearchQuery";
import { useDispatch } from "react-redux";
import { LinearProgress } from "@material-ui/core";
import makeStyles from "@material-ui/core/styles/makeStyles";
import SearchIcon from "@material-ui/icons/Search";
import InputBase from "@material-ui/core/InputBase";
import { fade } from "@material-ui/core/styles";
import Fade from "@material-ui/core/Fade";

const useStyles = makeStyles((theme) => ({
  inputRoot: {
    color: "inherit",
  },
  inputInput: {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
    transition: theme.transitions.create("width"),
    width: "100%",
    [theme.breakpoints.up("md")]: {
      width: "20ch",
    },
  },
  search: {
    position: "relative",
    borderRadius: theme.shape.borderRadius,
    backgroundColor: fade(theme.palette.common.white, 0.15),
    "&:hover": {
      backgroundColor: fade(theme.palette.common.white, 0.25),
    },
    marginRight: theme.spacing(2),
    marginLeft: 0,
    width: "100%",
    [theme.breakpoints.up("sm")]: {
      marginLeft: theme.spacing(3),
      width: "auto",
    },
  },
  searchIcon: {
    padding: theme.spacing(0, 2),
    height: "100%",
    position: "absolute",
    pointerEvents: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
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
    <div className={classes.search}>
      <div className={classes.searchIcon}>
        <SearchIcon />
      </div>
      <InputBase
        placeholder="Search…"
        value={value}
        onChange={handleChange}
        classes={{
          root: classes.inputRoot,
          input: classes.inputInput,
        }}
        inputProps={{ "aria-label": "search" }}
      />
      <Fade in={exampleIds.isLoading}>
        <LinearProgress />
      </Fade>
    </div>
    // <FilterCheckboxes />
  );
};
export default SearchBar;