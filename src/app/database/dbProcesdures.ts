import { mainThreadDB } from "app/database/database";
import Data from "app/data_clients/datainterfaces";
import AIWorkerSingleton from "app/workers/aiWorker/AIWorkerSingleton";

export async function rejectLabel(exampleId: string, label: string) {
  let example: Data.Example | undefined = await mainThreadDB.example.get(
    exampleId
  );
  let rejectedLabels = new Set<string>(example?.rejectedLabels || []);
  rejectedLabels.add(label);
  await mainThreadDB.transaction(
    "rw",
    [mainThreadDB.example, mainThreadDB.tfidf, mainThreadDB.vector],
    async () => {
      const labelState: Partial<Data.LabelState> = {
        hasNegativeOrRejectedLabel: 1,
        rejectedLabels: Array.from(rejectedLabels),
      };

      await mainThreadDB.example.update(exampleId, labelState);
      await mainThreadDB.tfidf.update(exampleId, labelState);
      await mainThreadDB.vector.update(exampleId, labelState);
    }
  );
  console.log(`rejected label ${label} for example ${exampleId}`);
  const workerController = AIWorkerSingleton.getInstance();
  workerController.afterNewLabel();

  return;
}
