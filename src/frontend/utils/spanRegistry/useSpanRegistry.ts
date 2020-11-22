import React from "react";

function scrollToElementById(elementId: string) {
  const element = document.getElementById(elementId);
  if (element) {
    element.scrollIntoView({ behavior: "smooth", block: "center" });
    // element.scrollIntoView()

    element.focus({ preventScroll: false });
    return true;
  }

  return false;
}
function useSpanRegistry() {
  const spansIdRef = React.useRef([] as string[]);
  const currentRef = React.useRef(0 as number | undefined);

  const gotoNext = React.useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault(); // Maintain the focus on the scrolled element
      e.stopPropagation();

      if (spansIdRef.current.length > 0 && currentRef.current !== undefined) {
        const nextIx = currentRef.current + 1 || 0;
        const nextElementId = spansIdRef.current[nextIx];
        if (scrollToElementById(nextElementId)) {
          currentRef.current = nextIx;
        }
      }
    },
    [spansIdRef, currentRef]
  );

  const gotoPrev = React.useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault(); // Maintain the focus on the scrolled element
      e.stopPropagation();
      if (spansIdRef.current.length > 0 && currentRef.current !== undefined) {
        const prevIx = currentRef.current - 1 || 0;
        const prevElementId = spansIdRef.current[prevIx];
        if (scrollToElementById(prevElementId)) {
          currentRef.current = prevIx;
          e.preventDefault(); // Maintain the focus on the scrolled element
        }
      }
    },
    [spansIdRef, currentRef]
  );

  const addSpanId = React.useCallback(
    (spanId: string) => {
      spansIdRef.current = [...spansIdRef.current, spanId];
    },
    [spansIdRef]
  );

  return { addSpanId, gotoNext, gotoPrev };
}
export default useSpanRegistry;
