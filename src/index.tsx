import React from "react";
import ReactDOM from "react-dom";
import App from "./app/App";
import { IndexWorkerController } from "app/docIndex/IndexWorkerController";
IndexWorkerController.initializeIndex().then(() => {
  ReactDOM.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
    document.getElementById("root")
  );
});
