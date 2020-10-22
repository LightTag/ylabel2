import React from "react";
import ReactDOM from "react-dom";
import App from "./app/App";
import { IndexWorkerSingleton } from "app/docIndex/IndexWorkerSingleton";
const indexWorkerSingleton = IndexWorkerSingleton.getInstance();
indexWorkerSingleton.initializeIndex().then(() => {
  ReactDOM.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
    document.getElementById("root")
  );
});
