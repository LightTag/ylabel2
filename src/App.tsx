import React, { FunctionComponent } from "react";
import { Provider } from "react-redux";
import "typeface-roboto";
import { QueryCache, ReactQueryCacheProvider } from "react-query";
import { ReflexContainer, ReflexElement, ReflexSplitter } from "react-reflex";
import "react-reflex/styles.css";
import { CssBaseline } from "@material-ui/core";
import useSearchQuery from "./frontend/QueryContext/useSearchQuery";
import Switch from "@material-ui/core/Switch";
import ActiveLearningContextProvider from "./frontend/active_learning/ActiveLearningContext";
import ActiveLearningBody from "./frontend/active_learning/ActiveLearningBody";
import useSpanRegistry from "./frontend/utils/spanRegistry/useSpanRegistry";
import Example from "./frontend/components/example/Example";
import FileUploadButton from "./frontend/components/dataUpload/simpleDataUpload";
import store from "./frontend/redux-state/rootState";
import Grid from "@material-ui/core/Grid";
import SearchBar from "./frontend/components/searchBar/SearchBar";
import WorkComp from "./frontend/classifier/workerComp";
import LabelControls from "./frontend/components/labelControls/labelControls";
import D3Chart from "./frontend/classifier/d3ConfChart";

const Body: FunctionComponent = () => {
  const spanRegistry = useSpanRegistry();

  const exampleIds = useSearchQuery();
  const [isAL, setIsAL] = React.useState<boolean>(false);
  const source = exampleIds.data ? exampleIds.data : [];
  return (
    <div
      style={{
        height: "100%",
        padding: "2rem",
        maxHeight: "100%",
        overflowY: "auto",
      }}
    >
      <Switch value={isAL} onChange={(e, v) => setIsAL(v)} />
      {isAL ? (
        <ActiveLearningContextProvider>
          <ActiveLearningBody />
        </ActiveLearningContextProvider>
      ) : (
        source
          .slice(0, 10)
          .map((ex) => (
            <Example
              key={ex}
              score={1}
              exampleId={ex}
              addSpanId={spanRegistry.addSpanId}
            />
          ))
      )}
    </div>
  );
};

export const Dataset: FunctionComponent = () => {
  return <FileUploadButton />;
};
const cache = new QueryCache();

export function App() {
  return (
    <Provider store={store}>
      <ReactQueryCacheProvider queryCache={cache}>
        <CssBaseline />
        <ReflexContainer
          orientation="horizontal"
          style={{
            height: "100vh",
            width: "100vw",
            whiteSpace: "pre-wrap",
            padding: "3rem",
          }}
        >
          <ReflexElement flex={0.2} propagateDimensions={true}>
            <Grid container>
              <Grid item xs={6}>
                <SearchBar />
              </Grid>
              <Grid item xs={6}>
                <Dataset />
                <WorkComp />
              </Grid>
            </Grid>
          </ReflexElement>
          <ReflexElement flex={0.8}>
            <ReflexContainer orientation="vertical">
              <ReflexElement className="left-pane" propagateDimensions>
                <Body />
              </ReflexElement>
              <ReflexSplitter />

              <ReflexElement propagateDimensions>
                <ReflexContainer orientation="horizontal">
                  <ReflexElement
                    className="left-pane"
                    propagateDimensions
                    flex={1}
                  >
                    <div
                      style={{
                        height: "100%",
                        padding: "2rem",
                        maxHeight: "100%",
                        overflowY: "auto",
                      }}
                    >
                      <LabelControls />
                      <D3Chart />
                      {/*<PredictionStats />*/}
                    </div>
                  </ReflexElement>
                </ReflexContainer>
              </ReflexElement>
            </ReflexContainer>
          </ReflexElement>
        </ReflexContainer>
      </ReactQueryCacheProvider>
    </Provider>
  );
}

export default App;
