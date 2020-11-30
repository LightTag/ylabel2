import React from "react";
import {
  AutoSizer,
  CellMeasurer,
  CellMeasurerCache,
  List,
  ListRowProps,
} from "react-virtualized";
import Example from "../example/Example";

const cache = new CellMeasurerCache({
  fixedWidth: true,
});
const ExampleRenderer: React.FunctionComponent<{
  exampleId: string;
  virtualizedRowProps: ListRowProps;
}> = (props) => (
  <CellMeasurer
    cache={cache}
    columnIndex={0}
    key={props.virtualizedRowProps.key}
    parent={props.virtualizedRowProps.parent}
    rowIndex={props.virtualizedRowProps.index}
  >
    {({ measure }) => (
      <div style={props.virtualizedRowProps.style}>
        <Example
          key={props.exampleId}
          exampleId={props.exampleId}
          onLoad={measure}
        />
      </div>
    )}
  </CellMeasurer>
);
const ExampleInfiniteScroll: React.FunctionComponent<{
  exampleIds: string[];
}> = (props) => {
  const examples = props.exampleIds;
  return (
    <AutoSizer>
      {({ height, width }) => (
        <List
          rowHeight={cache.rowHeight}
          rowCount={examples.length}
          width={width}
          height={height}
          rowRenderer={(renderProps) => (
            <ExampleRenderer
              virtualizedRowProps={renderProps}
              exampleId={props.exampleIds[renderProps.index]}
            />
          )}
          deferredMeasurementCache={cache}
        />
      )}
    </AutoSizer>
  );
};

export default ExampleInfiniteScroll;
