import React from "react";
import {
  mainThreadDB,
  OurDatabase,
  TableNames,
  TDBChangeCallback,
} from "app/database/database";
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
  }, [1]);
  return query;
}

export default useDatabase;
