import React, { FunctionComponent } from "react";
import { Provider } from "react-redux";

import "./App.css";
import "typeface-roboto";
import DBClient, { label, model } from "./data_clients/dbclient";
import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "react-query";
import CircularProgress from "@material-ui/core/CircularProgress";
import { ReflexContainer, ReflexSplitter, ReflexElement } from "react-reflex";

import "react-reflex/styles.css";
import { CssBaseline } from "@material-ui/core";
import Example from "./components/example/Example";
import useSpanRegistry from "./utils/spanRegistry/useSpanRegistry";
import store, { useTypedSelector } from "./redux-state/rootState";
import ClassificationStats from "./components/classificationStats";
import FileUploadButton from "./components/dataUpload/simpleDataUpload";
import { selectExampleIds } from "./redux-state/examples/exampleSelectors";

const Body: FunctionComponent = () => {
  const spanRegistry = useSpanRegistry();
  const exampleIds = useTypedSelector(selectExampleIds).slice(100, 200);

  return (
    <div style={{ height: "100%", padding: "2rem" }}>
      <div style={{ margin: "2rem" }}>
        <button onMouseDown={spanRegistry.gotoPrev}>Prev </button>
        <button onMouseDown={spanRegistry.gotoNext}>Next </button>
      </div>
      <div style={{ height: "80%", maxHeight: "80%", overflowY: "auto" }}>
        {exampleIds.map((exampleId) => (
          <Example
            key={exampleId}
            exampleId={exampleId as string}
            addSpanId={spanRegistry.addSpanId}
          />
        ))}
      </div>
    </div>
  );
};

const Labelset: FunctionComponent = () => {
  const client = new DBClient();
  const query = useQuery("labelset", () =>
    client.getLabelset({ select: "*,label(*),model!model_labelset_fk(*)" })
  );

  if (query.isLoading) {
    return <CircularProgress />;
  }
  if (query.isSuccess && query.data && query.data.body) {
    const labelsets = query.data.body;

    return (
      <div>
        <ul>
          {labelsets.map((ls) => (
            <li>
              <div>{ls.labelset_name}</div>{" "}
              <ul>
                {ls.label.map((l: label) => (
                  <li>{`${l.bilu}-${l.label}`}</li>
                ))}
              </ul>{" "}
              <ul>
                {ls.model.map((l: model) => (
                  <li>{l.model_name}</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    );
  }
  return <div> Bad</div>;
};

const Dataset: FunctionComponent = () => {
  return <FileUploadButton />;
};
const cache = new QueryCache();
const client = new QueryClient({ cache });

function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={client}>
        <CssBaseline />
        <ReflexContainer
          orientation="vertical"
          style={{
            height: "100vh",
            width: "100vw",
            whiteSpace: "pre-wrap",
            padding: "3rem",
          }}
        >
          <ReflexElement className="left-pane" propagateDimensions>
            <ReflexContainer orientation="horizontal">
              <ReflexElement className="left-pane" propagateDimensions>
                <ClassificationStats />
              </ReflexElement>
              <ReflexSplitter />
              <ReflexElement className="left-pane" propagateDimensions>
                <Dataset />
              </ReflexElement>
            </ReflexContainer>
          </ReflexElement>

          <ReflexSplitter />
          <ReflexElement className="left-pane" propagateDimensions>
            <Body />
          </ReflexElement>
        </ReflexContainer>
      </QueryClientProvider>
    </Provider>
  );
}

export default App;
