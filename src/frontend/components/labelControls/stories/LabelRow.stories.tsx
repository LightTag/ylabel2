import React from "react";
import LabelRow from "../LabelRow";
import useMocklLabelController from "../../../../controllers/labelControllers/MockLabelController";
// eslint-disable-next-line import/no-anonymous-default-export
export default {
  title: "LabelRow",
  component: LabelRow,
};

export const LabelRowStory = () => {
  const labelController = useMocklLabelController();
  return (
    <LabelRow
      count={3}
      labelName={"Mufen"}
      selected={false}
      labelController={labelController}
    />
  );
};
