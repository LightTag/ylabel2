import React, { FunctionComponent } from "react";
import { Provider } from "react-redux";

import "./App.css";
import "typeface-roboto";
import DBClient, {
  example,
  label,
  model,
  Response_getExample_200,
} from "./data_clients/dbclient";
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
import store from "./redux-state/rootState";
import ClassificationStats from "./components/classificationStats";

const Body: FunctionComponent = () => {
  const client = new DBClient();
  const spanRegistry = useSpanRegistry();
  const query = useQuery("examples", () =>
    client.getExample({ range: "1-2000" })
  );
  if (query.isLoading) {
    return <CircularProgress />;
  }
  if (query.isSuccess && query.data !== undefined) {
    const data = query.data.body as Required<example>[];
    return (
      <div style={{ height: "100%", padding: "2rem" }}>
        <div style={{ margin: "2rem" }}>
          <button onMouseDown={spanRegistry.gotoPrev}>Prev </button>
          <button onMouseDown={spanRegistry.gotoNext}>Next </button>
        </div>
        <div style={{ height: "80%", maxHeight: "80%", overflowY: "auto" }}>
          {data.map((ex) => (
            <Example
              key={ex.example_id}
              example={ex}
              addSpanId={spanRegistry.addSpanId}
            />
          ))}
        </div>
      </div>
    );
  } else {
    return <div>Hello</div>;
  }
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
  const client = new DBClient();
  const query = useQuery("dataset", () => client.getDataset({}));

  // Create a cache
  const cache = new QueryCache();

  // Create a client
  if (query.isLoading) {
    return <CircularProgress />;
  }
  if (query.isSuccess && query.data && query.data.body) {
    const datasets = query.data.body;
    return (
      <div>
        <ul>
          {datasets.map((ds) => (
            <li>{ds.dataset_name}</li>
          ))}
        </ul>
      </div>
    );
  } else {
    return <div> Bad</div>;
  }
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
