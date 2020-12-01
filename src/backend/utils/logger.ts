function logger(...message: any) {
  if (process.env.NODE_ENV === "development") {
    // eslint-disable-next-line no-console
    console.log(message);
  }
}

export default logger;
