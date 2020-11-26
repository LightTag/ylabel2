import React from "react";
import { Provider } from "react-redux";
import "typeface-roboto";
import { QueryCache, ReactQueryCacheProvider } from "react-query";
import "react-reflex/styles.css";
import { CssBaseline } from "@material-ui/core";
import store from "./frontend/redux-state/rootState";
import createMuiTheme from "@material-ui/core/styles/createMuiTheme";
import { ThemeProvider } from "@material-ui/core/styles";
import OpenAnnotationBody from "./frontend/components/layouts/OpenAnnotationBodyLayout";
import PrimarySearchAppBar from "./frontend/components/appBar/Appbar";

const theme = createMuiTheme({
  typography: {
    fontSize: 10,
    fontFamily: "Roboto",
  },
});

const cache = new QueryCache();

export function App() {
  return (
    <Provider store={store}>
      <ReactQueryCacheProvider queryCache={cache}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <PrimarySearchAppBar />
          <OpenAnnotationBody />
        </ThemeProvider>
      </ReactQueryCacheProvider>
    </Provider>
  );
}

export default App;
