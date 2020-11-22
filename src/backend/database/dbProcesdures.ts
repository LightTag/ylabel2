import { mainThreadDB } from "./database";
import Data from "../data_clients/datainterfaces";
import AIWorkerSingleton from "../workers/aiWorker/AIWorkerSingleton";

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

export function applyLabel(exampleId: string, labelName: string) {
  return mainThreadDB.transaction(
    "rw",
    [mainThreadDB.example, mainThreadDB.tfidf, mainThreadDB.vector],
    async () => {
      const example = await mainThreadDB.example.get(exampleId);
      if (example) {
        const labelState: Partial<Data.LabelState> = {
          label: labelName || undefined,
          hasLabel: labelName !== null ? 1 : -1,
          hasNegativeOrRejectedLabel:
            labelName || (example.rejectedLabels || []).length > 0 ? 1 : -1,
        };

        await mainThreadDB.example.update(exampleId, labelState);
        await mainThreadDB.tfidf.update(exampleId, labelState);
        await mainThreadDB.vector.update(exampleId, labelState);
      }
    }
  );
}
