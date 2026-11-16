import { useCallback, useRef } from 'react';
import { Dimensions, Point } from '../domain/types';
import { MIN_NOTE_HEIGHT, MIN_NOTE_WIDTH } from '../domain/constants';

export interface UseResizeOptions {
  minWidth?: number;
  minHeight?: number;
  onResizeStart?: (initialDimensions: Dimensions) => void;
  onResize?: (newDimensions: Dimensions) => void;
  onResizeEnd?: (finalDimensions: Dimensions) => void;
}

export function useResize({
  minWidth = MIN_NOTE_WIDTH,
  minHeight = MIN_NOTE_HEIGHT,
  onResizeStart,
  onResize,
  onResizeEnd,
}: UseResizeOptions) {
  const isResizingRef = useRef(false);
  const startPointerRef = useRef<Point>({ x: 0, y: 0 });
  const startDimRef = useRef<Dimensions>({ width: minWidth, height: minHeight });
  const currentDimRef = useRef<Dimensions>({ width: minWidth, height: minHeight });

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLElement>, initialDim: Dimensions) => {
      if (e.button !== 0) return;

      e.stopPropagation();
      const target = e.currentTarget;
      target.setPointerCapture(e.pointerId);

      isResizingRef.current = true;
      startPointerRef.current = { x: e.clientX, y: e.clientY };
      startDimRef.current = { ...initialDim };
      currentDimRef.current = { ...initialDim };

      onResizeStart?.(initialDim);
    },
    [onResizeStart]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      if (!isResizingRef.current) return;

      e.stopPropagation();
      const dx = e.clientX - startPointerRef.current.x;
      const dy = e.clientY - startPointerRef.current.y;

      const newWidth = Math.max(minWidth, startDimRef.current.width + dx);
      const newHeight = Math.max(minHeight, startDimRef.current.height + dy);

      const nextDim: Dimensions = { width: newWidth, height: newHeight };
      currentDimRef.current = nextDim;
      onResize?.(nextDim);
    },
    [minWidth, minHeight, onResize]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      if (!isResizingRef.current) return;

      e.stopPropagation();
      isResizingRef.current = false;

      try {
        if (e.currentTarget.hasPointerCapture(e.pointerId)) {
          e.currentTarget.releasePointerCapture(e.pointerId);
        }
      } catch {
        // Fallback
      }

      onResizeEnd?.(currentDimRef.current);
    },
    [onResizeEnd]
  );

  return {
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    isResizingRef,
  };
}
