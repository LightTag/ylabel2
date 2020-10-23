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
import LabelControls from "./components/labelControls/labelControls";
import FileUploadButton from "./components/dataUpload/simpleDataUpload";
import WorkComp from "app/classifier/workerComp";
import PredictionStats from "app/components/predictionStats";
import useSearchQuery from "app/QueryContext/useSearchQuery";
import D3Chart from "app/classifier/d3ConfChart";
import SearchBar from "app/components/searchBar/SearchBar";

const Body: FunctionComponent = () => {
  const spanRegistry = useSpanRegistry();
  const exampleIds = useSearchQuery();

  return (
    <div style={{ height: "100%", padding: "2rem" }}>
      <div style={{ margin: "2rem" }}>
        <SearchBar />
      </div>
      <div style={{ height: "80%", maxHeight: "80%", overflowY: "auto" }}>
        {exampleIds.data
          ? //@ts-ignore
            exampleIds.data
              .slice(0, 10)
              .map((ex) => (
                <Example
                  key={ex}
                  score={1}
                  exampleId={ex}
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
                <LabelControls />
              </ReflexElement>
              <ReflexSplitter />
              <ReflexElement className="left-pane" propagateDimensions>
                <PredictionStats />
                <Dataset />
                <WorkComp />
                <D3Chart />
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
