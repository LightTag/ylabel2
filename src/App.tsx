import React from "react";
import { Provider } from "react-redux";
import "typeface-roboto";
import { QueryCache, ReactQueryCacheProvider } from "react-query";
import "react-reflex/styles.css";
import { CssBaseline } from "@material-ui/core";
import store from "./frontend/redux-state/rootState";
import createMuiTheme from "@material-ui/core/styles/createMuiTheme";
import { ThemeProvider } from "@material-ui/core/styles";
import PrimarySearchAppBar from "./frontend/components/appBar/Appbar";
import LayoutDispatch from "./frontend/components/layouts/LayoutDispatch";
import makeStyles from "@material-ui/core/styles/makeStyles";

const theme = createMuiTheme({
  typography: {
    fontSize: 10,
    fontFamily: "Roboto",
  },
});

const cache = new QueryCache();
const useStyles = makeStyles(() => ({
  "@global": {
    "*:focus": {
      outline: 0,
    },
    //don't use the browsers outline for selected stuff
  },
}));
export function App() {
  const classes = useStyles();
  return (
    <Provider store={store}>
      <ReactQueryCacheProvider queryCache={cache}>
        <ThemeProvider theme={theme}>
          <CssBaseline classes={classes} />
          <PrimarySearchAppBar />
          <LayoutDispatch />
        </ThemeProvider>
      </ReactQueryCacheProvider>
    </Provider>
  );
}

export default App;
