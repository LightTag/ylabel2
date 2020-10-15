import React, { FunctionComponent } from "react";
import DBClient, {
  example,
  human_annotation,
} from "../../data_clients/dbclient";
import { makeStyles } from "@material-ui/core/styles";
import { Paper } from "@material-ui/core";
import LabselsetColors from "../../utils/labelsetcolors/labelsetcolors";
// import ClassificationSelect from "./ClassificationSelect";
import Fade from "@material-ui/core/Fade";
import classificationSelectors from "../../redux-state/classification/classificationSelectors";
import { useGetExampleFromDBByExampleId } from "../../data_clients/exampleDataStore";

interface Props {
  exampleId: string;
  addSpanId: (spanId: string) => void;
}
const useStyles = makeStyles((theme) => ({
  root: {
    height: "fit-content",
    maxHeight: "65%",

    boxShadow: "4px 4px 4px #CDCDCD ",
    margin: theme.spacing(3),
    padding: theme.spacing(3),
    lineHeight: "2.5rem",
  },
  body: {
    height: "85%",
    overflowY: "auto",
    padding: theme.spacing(3),
  },
  ribbon: {
    height: "15%",
  },
}));
declare namespace ExampleRange {
  type TextRange = {
    start: number;
    end: number;
    text: string;
  };
  export type EmptyRange = {
    kind: "empty";
  } & TextRange;
  export type AnnotatedRange = {
    kind: "annotated";
    annotation: Required<human_annotation>;
  } & TextRange;

  export type AnyRange = EmptyRange | AnnotatedRange;
}
function splitExampleToRanges(
  example: Required<example>,
  annotations: Required<human_annotation>[]
): ExampleRange.AnyRange[] {
  const results: ExampleRange.AnyRange[] = [];
  let cursor = 0;
  for (const annotation of annotations) {
    if (cursor > annotation.end_offset) {
      // we have a duplicate
      continue;
    }
    if (annotation.start_offset > cursor) {
      const emptyText = example.content.slice(cursor, annotation.start_offset);
      results.push({
        start: cursor,
        end: annotation.start_offset,
        text: emptyText,
        kind: "empty",
      });
    }
    const annotatedText = example.content.slice(
      annotation.start_offset,
      annotation.end_offset
    );
    results.push({
      start: annotation.start_offset,
      end: annotation.end_offset,
      text: annotatedText,
      kind: "annotated",
      annotation,
    });
    cursor = annotation.end_offset;
  }
  if (cursor < example.content.length) {
    const finalText = example.content.slice(cursor, example.content.length);
    results.push({
      start: cursor,
      end: example.content.length,
      text: finalText,
      kind: "empty",
    });
  }
  return results;
}

export async function getExampleAnnotations(
  example: Required<example>,
  labelsetName: string
): Promise<ExampleRange.AnyRange[]> {
  const client = new DBClient();
  const response = await client.getHumanAnnotation({
    exampleId: `eq.${example.example_id}`,
    labelsetName: `eq.${labelsetName}`,
  });
  const data = response.body as Required<human_annotation>[];
  return splitExampleToRanges(example, data);
}

export const EmptySpan: FunctionComponent<{ span: ExampleRange.EmptyRange }> = (
  props
) => {
  const handleMouseUp: React.MouseEventHandler = (e) => {
    const selection = window.getSelection();
    if (selection) {
      const range = selection.getRangeAt(0);
      const _start = range.startOffset;
      const _end = range.endOffset;
      const spanStart = Math.min(_start, _end);
      const spanEnd = Math.max(_start, _end);
      const selected = props.span.text.slice(spanStart, spanEnd);
      console.log(spanStart, spanEnd, selected);
    }
  };

  return <span onMouseUp={handleMouseUp}>{props.span.text}</span>;
};
const useAnnotatedSpanStyles = makeStyles(() => ({
  body: {
    position: "relative",
    fontWeight: "bold",
    border: "0.5px solid black",
    userSelect: "none",
    boxShadow: "none",
    "&:focus": {
      boxShadow: "4px 4px 4px green ",
    },
  },
  label: {
    top: "-1.25rem",
    position: "absolute",
    fontSize: "0.75rem",
    lineHeight: "1rem",
    width: "100%",
    color: "white",
    paddingLeft: "0.25rem",
  },
}));
const AnnotatedSpan: FunctionComponent<{
  span: ExampleRange.AnnotatedRange;
  addSpanId: (spanId: string) => void;
}> = (props) => {
  const classes = useAnnotatedSpanStyles();
  const annotation = props.span.annotation;
  const { addSpanId } = props;
  const spanId = React.useMemo(
    () => `${annotation.example_id}-${annotation.start_offset}`,
    [annotation]
  );
  React.useEffect(() => {
    addSpanId(spanId);
    return () => {
      console.log(spanId);
    };
  }, [spanId, addSpanId]);
  return (
    <span
      className={classes.body}
      id={spanId}
      onFocus={() => console.log(spanId)}
      // tabIndex={1}
    >
      <span
        className={classes.label}
        style={{
          background: LabselsetColors.getLabelColor(
            props.span.annotation.label
          ),
        }}
      >
        {props.span.annotation.label}
      </span>
      {props.span.text}
    </span>
  );
};
export const ExampleSpan: FunctionComponent<{
  span: ExampleRange.AnyRange;
  addSpanId: (spanId: string) => void;
}> = (props) => {
  switch (props.span.kind) {
    case "annotated":
      return <AnnotatedSpan span={props.span} addSpanId={props.addSpanId} />;
    case "empty":
      return <EmptySpan span={props.span} />;
  }
};
const Example: FunctionComponent<Props> = (props) => {
  const classes = useStyles();
  const exampleQuery = useGetExampleFromDBByExampleId(props.exampleId);
  const currentClass = classificationSelectors.useSelectExampleClassification(
    props.exampleId
  );

  const [showRibbon, setShowRibbon] = React.useState<boolean>(false);
  if (exampleQuery.isSuccess && exampleQuery.data) {
    return (
      <Paper
        tabIndex={1}
        className={classes.root}
        onFocus={() => setShowRibbon(true)}
        onBlur={() => setShowRibbon(false)}
      >
        <div className={classes.ribbon}>
          {/*<Fade in={showRibbon} mountOnEnter unmountOnExit>*/}
          {/*  <ClassificationSelect exampleId={props.exampleId} />*/}
          {/*</Fade>*/}
          <Fade in={!showRibbon}>
            <div>{currentClass || null}</div>
          </Fade>
        </div>
        <div className={classes.body} dir={"auto"}>
          {/*{annotationQuery.data.map((span) => (*/}
          {/*  <ExampleSpan*/}
          {/*    span={span}*/}
          {/*    key={span.start}*/}
          {/*    addSpanId={props.addSpanId}*/}
          {/*  />*/}
          {/*))}*/}
          {exampleQuery.data.content}
        </div>
      </Paper>
    );
  } else {
    return <div>HI</div>;
  }
};

export default Example;
