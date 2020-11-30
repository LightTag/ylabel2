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
import Beacon from "../Beacon";
import InputAdornment from "@material-ui/core/InputAdornment";

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
  resultCount: {
    margin: theme.spacing(0, 1),
    fontWeight: "bold",
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

  const { searchQuery, everSearched } = useTypedSelector(
    (state) => state.searchReducer
  );
  const [value, setValue] = React.useState<string | undefined>(
    searchQuery || undefined
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
    }, 250),
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
    if (searchQuery) {
      setValue(searchQuery);
    }
  }, [searchQuery]);

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
        endAdornment={
          <InputAdornment position={"end"}>
            <span className={classes.resultCount}>
              {" "}
              {exampleIds.data?.length}
            </span>
          </InputAdornment>
        }
      />
      <Fade in={exampleIds.isLoading}>
        <LinearProgress />
      </Fade>
      <Beacon show={!everSearched} />
    </div>
    // <FilterCheckboxes />
  );
};
export default SearchBar;
