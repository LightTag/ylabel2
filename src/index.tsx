import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { IndexWorkerSingleton } from "./backend/workers/docIndex/IndexWorkerSingleton";

const indexWorkerSingleton = IndexWorkerSingleton.getInstance();
indexWorkerSingleton
  .initializeIndex()
  .then(() => {})
  .catch((err) => {});
ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(logger))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
