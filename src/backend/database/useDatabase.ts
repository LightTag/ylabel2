import React from "react";
import {
  mainThreadDB,
  OurDatabase,
  TableNames,
  TDBChangeCallback,
} from "./database";
import { QueryKey, useQuery } from "react-query";

function useDatabase<T>(
  queryKey: QueryKey,
  table: TableNames,
  dbQuery: (db: OurDatabase) => Promise<T>,
  changeKey: string | undefined
) {
  const query = useQuery(queryKey, () => dbQuery(mainThreadDB));
  React.useEffect(() => {
    const resetQueryCallback: TDBChangeCallback = (change) => {
      if (change.table === table) {
        if (changeKey === undefined || changeKey === change.key) {
          query.refetch();
        }
      }
    };
    mainThreadDB.addTableEventListener(table, resetQueryCallback);
    return () => {
      mainThreadDB.removeTableEventListener(table, resetQueryCallback);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return query;
}
export function useExampleCount() {
  const exampleCountQuery = useDatabase(
    "exampleCount",
    "example",
    (db) => db.example.count(),
    undefined
  );
  return exampleCountQuery;
}
export function useLabelCount() {
  const exampleCountQuery = useDatabase(
    "labelCount",
    "label",
    (db) => db.label.count(),
    undefined
  );
  return exampleCountQuery;
}

export function usePredictionCount() {
  const exampleCountQuery = useDatabase(
    "predictionCount",
    "example",
    (db) => db.example.where({ hasPrediction: 1 }).count(),
    undefined
  );
  return exampleCountQuery;
}
export default useDatabase;
