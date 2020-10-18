import React, { FunctionComponent } from "react";
import { Provider } from "react-redux";
import "./index.css";
import "./App.css";
import "typeface-roboto";
import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
  // useQuery,
} from "react-query";
import { ReflexContainer, ReflexElement, ReflexSplitter } from "react-reflex";
import "react-reflex/styles.css";
import { CssBaseline } from "@material-ui/core";
import Example from "./components/example/Example";
import useSpanRegistry from "./utils/spanRegistry/useSpanRegistry";
import store from "./redux-state/rootState";
import ClassificationStats from "./components/classificationStats";
import FileUploadButton from "./components/dataUpload/simpleDataUpload";
import debounce from "@material-ui/core/utils/debounce";
import WorkComp from "app/classifier/workerComp";
import TextField from "@material-ui/core/TextField";
// import { IndexWorkerController } from "app/docIndex/IndexWorkerController";
import useDatabase from "app/database/useDatabase";
import { sortBy } from "lodash";
import Data from "app/data_clients/datainterfaces";

const Body: FunctionComponent = () => {
  const spanRegistry = useSpanRegistry();
  const [, setQuery] = React.useState<string>("");
  const [tot] = React.useState<number>(0);
  // const examples = useQuery(["example", "search", query], () =>
  //   IndexWorkerController.query(query)
  // );
  const examples = useDatabase(["vecotor"], "tfidf", (db) =>
    db.example
      .where({ hasLabel: -1, hasPrediction: 1 })
      .and((x) => x.predictedLabel === "toxic")
      .limit(200)
      .toArray()
  );

  const handleChange = debounce((e) => setQuery(e.target.value), 50);

  return (
    <div style={{ height: "100%", padding: "2rem" }}>
      <div style={{ margin: "2rem" }}>
        <button onMouseDown={spanRegistry.gotoPrev}>Prev </button>
        <button onMouseDown={spanRegistry.gotoNext}>Next </button>
        <TextField
          variant={"outlined"}
          onChange={(e) => {
            e.persist();
            handleChange(e);
          }}
          helperText={`${tot} items`}
        />
      </div>
      <div style={{ height: "80%", maxHeight: "80%", overflowY: "auto" }}>
        {examples.data
          ? //@ts-ignore
            sortBy(examples.data, (x: Data.Example) => x.confidence || 0)
              .slice(0, 10)
              .map((ex) => (
                <Example
                  key={ex.exampleId}
                  score={1}
                  exampleId={ex.exampleId as string}
                  addSpanId={spanRegistry.addSpanId}
                />
              ))
          : null}
      </div>
    </div>
  );
};

// const Labelset: FunctionComponent = () => {
//   const client = new DBClient();
//   const query = useQuery("labelset", () =>
//     client.getLabelset({ select: "*,label(*),model!model_labelset_fk(*)" })
//   );
//
//   if (query.isLoading) {
//     return <CircularProgress />;
//   }
//   if (query.isSuccess && query.data && query.data.body) {
//     const labelsets = query.data.body;
//
//     return (
//       <div>
//         <ul>
//           {labelsets.map((ls) => (
//             <li>
//               <div>{ls.labelset_name}</div>{" "}
//               <ul>
//                 {ls.label.map((l: label) => (
//                   <li>{`${l.bilu}-${l.label}`}</li>
//                 ))}
//               </ul>{" "}
//               <ul>
//                 {ls.model.map((l: model) => (
//                   <li>{l.model_name}</li>
//                 ))}
//               </ul>
//             </li>
//           ))}
//         </ul>
//       </div>
//     );
//   }
//   return <div> Bad</div>;
// };

export const Dataset: FunctionComponent = () => {
  return <FileUploadButton />;
};
const cache = new QueryCache();
const client = new QueryClient({ cache });

export function App() {
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
          <ReflexElement propagateDimensions>
            <ReflexContainer orientation="horizontal">
              <ReflexElement
                className="left-pane"
                propagateDimensions
                flex={0.5}
              >
                <ClassificationStats />
              </ReflexElement>
              <ReflexSplitter />
              <ReflexElement className="left-pane" propagateDimensions>
                <Dataset />
                <WorkComp />
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
