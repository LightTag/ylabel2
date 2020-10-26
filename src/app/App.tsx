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
import FileUploadButton from "./components/dataUpload/simpleDataUpload";
import WorkComp from "app/classifier/workerComp";
import useSearchQuery from "app/QueryContext/useSearchQuery";
import D3Chart from "app/classifier/d3ConfChart";
import SearchBar from "app/components/searchBar/SearchBar";
import Grid from "@material-ui/core/Grid";
import LabelControls from "app/components/labelControls/labelControls";
import useActiveLearning from "app/QueryContext/useActiveLearning";
import Switch from "@material-ui/core/Switch";

const Body: FunctionComponent = () => {
  const spanRegistry = useSpanRegistry();
  const exampleIds = useSearchQuery();
  const activeLearningExamples = useActiveLearning();
  const [isAL, setIsAL] = React.useState<boolean>(false);
  const source =
    isAL && activeLearningExamples.data
      ? activeLearningExamples.data.items.map((x) => x.exampleId)
      : exampleIds.data
      ? exampleIds.data
      : [];
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
      {source.slice(0, 10).map((ex) => (
        <Example
          key={ex}
          score={1}
          exampleId={ex}
          addSpanId={spanRegistry.addSpanId}
        />
      ))}
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
      </QueryClientProvider>
    </Provider>
  );
}
export default App;
