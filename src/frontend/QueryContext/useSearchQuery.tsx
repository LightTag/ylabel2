import React from "react";
import { useTypedSelector } from "../redux-state/rootState";
import { IndexWorkerSingleton } from "../../backend/workers/docIndex/IndexWorkerSingleton";
import { mainThreadDB } from "../../backend/database/database";
import intersection from "lodash/intersection";
import { useQuery } from "react-query";
import logger from "../../backend/utils/logger";
const indexWorkerSingleton = IndexWorkerSingleton.getInstance();
function useSearchQuery() {
  const searchParams = useTypedSelector((state) => state.searchReducer);

  const searchFunction = React.useCallback(async () => {
    logger("Calling search", searchParams);
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
          logger(`Got back ${keys.length} from filter`);
          logger("Filter was", searchParams);
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
        logger(
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  return useQuery(["search", searchParams], searchFunction);
}

export default useSearchQuery;
