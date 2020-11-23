function logger(...message: any) {
  // eslint-disable-next-line no-console
  console.log(message);
}

export default logger;

export enum EventKinds {
  tfidf = "tfidf",
  insertToDb = "insertToDb",
  trainSVM = "trainSVM",
  vectorize = "vectorize",
  validateModel = "validateModel",
}
