import * as Papa from "papaparse";

const readCsvFile = (file: File) => {
  return new Promise<Papa.ParseResult<any>>((resolve, reject) => {
    const parseConfig: Papa.ParseConfig = {
      worker: false,
      //@ts-ignore
      headerPlacement: true,
      dynamicTyping: true,
      complete: (result) => resolve(result),
      error: (error) => reject(error.message),
      skipEmptyLines: true,
      header: true,
    };
    Papa.parse(file, parseConfig);
  });
};
const readJSONAsynch = (file: File) => {
  return new Promise<Array<any>>((resolve, reject) => {
    let reader = new FileReader();
    reader.onload = () => {
      try {
        const str = reader.result as string;
        const json = JSON.parse(str);
        if (!Array.isArray(json)) {
          // PARSE returns something with type object that has length. So this checks if
          // we got the right thing
          reject(
            "The JSON you uploaded is a single object. Please convert it to an array of objects, one per example"
          );
        } else {
          resolve(json);
        }
      } catch (e) {
        reject("This JSON has errors. Please validate the JSON and try again");
      }
    };
    reader.readAsText(file);
  });
};
export const readUserInputFile = async (file: File) => {
  let data: any[];
  if (file.name.endsWith("json")) {
    data = await readJSONAsynch(file);
  } else {
    const papaParseResult = await readCsvFile(file);
    data = papaParseResult.data;
  }
  return data;
};
