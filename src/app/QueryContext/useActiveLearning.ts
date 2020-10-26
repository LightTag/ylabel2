import useDatabase from "app/database/useDatabase";
import { sortBy } from "lodash";
function useActiveLearning() {
  const query = useDatabase(
    ["examples", "forAL"],
    "example",
    async (db) => {
      const collection = await db.example.where({
        hasLabel: -1,
        hasPrediction: 1,
      });
      let items = await collection.toArray();
      items = sortBy(items, (x) => (x.confidence ? -x.confidence : 0));
      return { size: collection.count(), items };
    },
    undefined
  );
  return query;
}

export default useActiveLearning;
