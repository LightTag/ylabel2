import React, { FunctionComponent } from "react";
import useDatabase from "app/database/useDatabase";

const PredictionStats: FunctionComponent = () => {
  const results = useDatabase(
    "prediction/stats",
    "example",
    async (db) => {
      const labels = await db.label.toArray();
      return Promise.all(
        labels.map(async (label) => ({
          labelName: label.name,
          count: await db.example.where({ predictedLabel: label.name }).count(),
          correct: await db.example
            .where({ predictedLabel: label.name, label: label.name })
            .count(),
          totalTrue: await db.example.where({ label: label.name }).count(),
          seen: await db.example
            .where({ predictedLabel: label.name, hasLabel: 1 })
            .count(),
        }))
      );
    },
    undefined
  );
  if (!results.data) {
    return <div> Loading </div>;
  } else {
    return (
      <table>
        {results.data.map((res) => (
          <tr key={res.labelName}>
            <td>{res.labelName}</td>
            <td>{res.count}</td>
            <td>{res.correct}</td>
            <td>{res.seen - res.correct}</td>
            <td>{res.totalTrue - res.correct}</td>
          </tr>
        ))}
      </table>
    );
  }
};

export default PredictionStats;
