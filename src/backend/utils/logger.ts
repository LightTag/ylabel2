function logger(message: any) {
  console.log(message);
}

export default logger;

export  enum EventKinds {
    tfidf = "tfidf",
    insertToDb = "insertToDb",
    trainSVM = "trainSVM",
    vectorize = "vectorize",
    validateModel = "validateModel",
}