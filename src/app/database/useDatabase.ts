import React from "react";
import { mainThreadDB, OurDatabase, TableNames } from "app/database/database";
import { QueryKey, useQuery } from "react-query";

function useDatabase<T>(
  queryKey: QueryKey,
  table: TableNames,
  dbQuery: (db: OurDatabase) => Promise<T>
) {
  const query = useQuery(queryKey, () => dbQuery(mainThreadDB));
  React.useEffect(() => {
    const resetQueryCallback = () => query.refetch();
    mainThreadDB.addTableEventListener(table, resetQueryCallback);
    return () => {
      mainThreadDB.removeTableEventListener(table, resetQueryCallback);
    };
  });
  return query;
}

export default useDatabase;
