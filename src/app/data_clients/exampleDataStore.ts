/*
 * We store raw text in IndexDB so the user has persistence but we don't fill the redux store with data
 * which would slow down persistence and hit edge cases where it doesn't persist at all
 * */
import localForage from "localforage";
import { extendPrototype } from "localforage-setitems";
import Data from "./datainterfaces";
import { useQuery } from "react-query";

extendPrototype(localForage);
export const exampleStoreIndexDB = localForage.createInstance({
  name: "exampledb-1", // Change the number for migrations
  driver: localForage.INDEXEDDB,
});

export function useGetExampleFromDBByExampleId(exampleId: string) {
  return useQuery(["exampleDB", exampleId], () =>
    exampleStoreIndexDB.getItem<Data.Example>(exampleId)
  );
}
