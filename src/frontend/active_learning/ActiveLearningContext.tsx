import React, { FunctionComponent } from "react";
import useActiveLearning from "./useActiveLearning";
import Data from "../../backend/data_clients/datainterfaces";

interface IContext {
  currentExample: Data.Example | undefined;
  goToNext: () => void;
}
export const ActiveLearningContext = React.createContext<IContext>(null as any);

const ActiveLearningContextProvider: FunctionComponent = (props) => {
  const activeLearningExamplesQuery = useActiveLearning();
  const [currentExample, setCurrentExample] = React.useState<
    Data.Example | undefined
  >(undefined);
  const [currentCursor, setCurrentCursor] = React.useState<number>(0);
  const activeLearningExamples = activeLearningExamplesQuery.data?.items;

  React.useEffect(() => {
    setCurrentCursor(0);
    if (
      currentCursor === 0 &&
      currentExample === undefined &&
      activeLearningExamples !== undefined
    ) {
      setCurrentExample(activeLearningExamples[currentCursor]);
    }
  }, [activeLearningExamples]);

  const goToNext = () => {
    const nextCursor = currentCursor + 1;
    setCurrentCursor(nextCursor);
    setCurrentExample(
      activeLearningExamples ? activeLearningExamples[nextCursor] : undefined
    );
  };
  const value = React.useMemo(
    () => ({
      goToNext,
      currentExample,
    }),
    [currentExample]
  );

  return (
    <ActiveLearningContext.Provider value={value}>
      {props.children}
    </ActiveLearningContext.Provider>
  );
};

export default ActiveLearningContextProvider;
