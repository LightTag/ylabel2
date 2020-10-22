import React from "react";
import { useTypedSelector } from "app/redux-state/rootState";
import { IndexWorkerSingleton } from "app/workers/docIndex/IndexWorkerSingleton";
import { mainThreadDB } from "app/database/database";
import intersection from "lodash/intersection";
import { useQuery } from "react-query";
function useSearchQuery() {
  const indexWorkerSingleton = IndexWorkerSingleton.getInstance();
  const searchParams = useTypedSelector((state) => state.searchReducer);
  const searchFunction = React.useCallback(async () => {
    const criteria = {
      hasLabel: searchParams.hasLabel || undefined,
      hasPrediction: searchParams.hasPrediction || undefined,
      label: searchParams.label || undefined,
      predictedLabel: searchParams.predictedLabel || undefined,
    };
    Object.keys(criteria).forEach(
      //@ts-ignore
      (key) => criteria[key] === undefined && delete criteria[key]
    );

    const filterFunction = () => {
      return (!searchParams.hasFilter
        ? mainThreadDB.example.toCollection()
        : mainThreadDB.example.where(criteria)
      )

        .primaryKeys()
        .then((keys) => {
          console.log(`Got back ${keys.length} from filter`);
          console.log("Filter was", searchParams);
          return keys;
        });
    };
    if (
      searchParams.searchQuery !== null &&
      searchParams.searchQuery.length > 0
    ) {
      const searchQuery = searchParams.searchQuery;
      return filterFunction().then(async (filterResult) => {
        const searchResults = await indexWorkerSingleton.query(searchQuery);
        console.log(
          `Search for "${searchQuery}" and got ${searchResults.results.length} results`
        );
        return intersection(
          searchResults.results.map((x) => x.exampleId),
          filterResult
        );
      });
    } else {
      return filterFunction();
    }
  }, [searchParams]);

  return useQuery(["search", searchParams], searchFunction);
}

export default useSearchQuery;
