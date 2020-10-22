import { AnalyticsData } from "app/data_clients/datainterfaces";
import { mainThreadDB } from "app/database/database";
import { deviation, mean } from "d3-array";
import PrecisionRecallKfoldMetric = AnalyticsData.PrecisionRecallKfoldMetric;
import logger from "app/utils/logger";
function calculateConf(
  data: AnalyticsData.PrecisionRecallKfoldMetric[]
): AnalyticsData.LabelValidationRun {
  const dMean = mean(data.map((x) => x.f1 || 0)) as number;
  const std = deviation(data.map((x) => x.f1 || 0)) || (0 as number);
  const ciFactor = 1.96 * (std / Math.sqrt(data.length));
  return {
    label: data[0].label,
    mean: dMean,
    lower: dMean - ciFactor,
    upper: dMean + ciFactor,
  };
}
async function getRunResults(): Promise<AnalyticsData.ValidationRunResult> {
  const labelArrays: Record<
    string,
    Record<string, PrecisionRecallKfoldMetric[]>
  > = {}; // For each label, hold an array of metrics for each timestamp
  const rawTrainingResults: AnalyticsData.PrecisionRecallKfoldMetric[] = await mainThreadDB.kfold.toArray();
  rawTrainingResults.forEach((res) => {
    if (labelArrays[res.label] === undefined) {
      debugger;
      labelArrays[res.label] = {};
    }
    const labelTimeStampMap = labelArrays[res.label];
    const timeStampString = res.timestamp.toISOString();
    if (labelTimeStampMap[timeStampString] === undefined) {
      labelTimeStampMap[timeStampString] = [];
    }
    labelTimeStampMap[timeStampString].push(res);
  });
  debugger;
  const result: AnalyticsData.ValidationRunResult = {};
  Object.keys(labelArrays).forEach((label) => {
    const labelMetricsByTimeStamp = labelArrays[label];
    const metricsSeries: AnalyticsData.LabelValidationRun[] = Object.values(
      labelMetricsByTimeStamp
    ).map(calculateConf);
    result[label] = metricsSeries;
  });
  logger(result);
  return result;
}

export default getRunResults;
