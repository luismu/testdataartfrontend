import { useCallback, useRef } from 'react';
import { Point } from '../domain/types';

export interface UseDragOptions {
  onDragStart?: (startPos: Point) => void;
  onDrag?: (currentPos: Point, delta: Point) => void;
  onDragEnd?: (finalPos: Point) => void;
}

export function useDrag({ onDragStart, onDrag, onDragEnd }: UseDragOptions) {
  const isDraggingRef = useRef(false);
  const startPointerRef = useRef<Point>({ x: 0, y: 0 });
  const startPosRef = useRef<Point>({ x: 0, y: 0 });
  const currentPosRef = useRef<Point>({ x: 0, y: 0 });

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLElement>, initialPos: Point) => {
      // Only handle primary button (left click)
      if (e.button !== 0) return;

      e.stopPropagation();
      const target = e.currentTarget;
      target.setPointerCapture(e.pointerId);

      isDraggingRef.current = true;
      startPointerRef.current = { x: e.clientX, y: e.clientY };
      startPosRef.current = { ...initialPos };
      currentPosRef.current = { ...initialPos };

      onDragStart?.(initialPos);
    },
    [onDragStart]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      if (!isDraggingRef.current) return;

      e.stopPropagation();
      const dx = e.clientX - startPointerRef.current.x;
      const dy = e.clientY - startPointerRef.current.y;

      const newPos: Point = {
        x: startPosRef.current.x + dx,
        y: startPosRef.current.y + dy,
      };

      currentPosRef.current = newPos;
      onDrag?.(newPos, { x: dx, y: dy });
    },
    [onDrag]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      if (!isDraggingRef.current) return;

      e.stopPropagation();
      isDraggingRef.current = false;

      try {
        if (e.currentTarget.hasPointerCapture(e.pointerId)) {
          e.currentTarget.releasePointerCapture(e.pointerId);
        }
      } catch {
        // Safe fallback in case pointer capture already released
      }

      onDragEnd?.(currentPosRef.current);
    },
    [onDragEnd]
  );

  return {
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    isDraggingRef,
  };
}
