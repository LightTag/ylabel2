import { addDocumentToIndex, createIndex } from "ndx";
import { query } from "ndx-query";
import Data from "../../data_clients/datainterfaces";
import { Index } from "ndx/src/index";
// import { tokenizer } from "../../data_clients/dbclient";
import { tokenizingRegex } from "../aiWorker/workerProcedures/vectorizers/tfidf";

function termFilter(term: string) {
  return term.toLowerCase();
}

function typedAddDocumentToIndex<T, D>(
  index: Index<T>,
  fieldAccessors: Array<(doc: D) => keyof D>,
  tokenizer: (s: string) => string[],
  filter: (s: string) => string,
  key: T,
  doc: D
): void {
  /*
      Make the callsignature of add document to index more adherent by using keyof
       */
  return addDocumentToIndex(
    index,
    fieldAccessors as Array<(doc: D) => string>,
    tokenizer,
    filter,
    key,
    doc
  );
}

const tokenizer = (s: string) => s.split(tokenizingRegex);

function createDocumentIndex(
  fields: (keyof Data.Example)[],
  existingIndex?: Index<string>
) {
  // `createIndex()` creates an index data structure.
  // First argument specifies how many different fields we want to index.
  const index = existingIndex || createIndex<string>(fields.length);
  // `fieldAccessors` is an array with functions that used to retrieve data from different fields.
  // const fieldAccessors = fields.map((f) => (doc: TData) => doc[f]);
  // `fieldBoostFactors` is an array of boost factors for each field, in this example all fields will have
  //@ts-ignore
  const fieldAccessors = fields.map((f) => (doc) => doc[f]);

  // identical factors.
  const fieldBoostFactors = fields.map(() => 1);

  return {
    // `add()` function will add documents to the index.
    _index: index,
    add: (doc: Data.Example) => {
      typedAddDocumentToIndex(
        index,
        fieldAccessors,
        // Tokenizer is a function that breaks text into words, phrases, symbols, or other meaningful elements
        // called tokens.
        // Lodash function `words()` splits string into an array of its words, see https://lodash.com/docs/#words for
        // details.
        tokenizer,
        // Filter is a function that processes tokens and returns terms, terms are used in Inverted Index to
        // index documents.
        termFilter,
        // Document key, it can be a unique document id or a refernce to a document if you want to store all documents
        // in memory.
        doc.exampleId,
        // Document.
        doc
      );
    },
    // `search()` function will be used to perform queries.
    search: (queryString: string) => {
      return query(
        index,
        fieldBoostFactors,
        // BM25 ranking function constants:
        1.2, // BM25 k1 constant, controls non-linear term frequency normalization (saturation).
        0.75, // BM25 b constant, controls to what degree document length normalizes tf values.
        tokenizer,
        termFilter,
        // Set of removed documents, in this example we don't want to support removing documents from the index,
        // so we can ignore it by specifying this set as `undefined` value.
        undefined,
        queryString
      );
    },
  };
}

export type IIndexAPI = ReturnType<typeof createDocumentIndex>;
export default createDocumentIndex;
