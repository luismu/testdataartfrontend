import { Rect } from './types';

/**
 * Checks whether two Axis-Aligned Bounding Boxes (AABBs) intersect.
 * Can require a minimum overlapping area ratio relative to the target if needed.
 */
export function isIntersecting(rectA: Rect, rectB: Rect, minOverlapRatio = 0): boolean {
  const left = Math.max(rectA.x, rectB.x);
  const right = Math.min(rectA.x + rectA.width, rectB.x + rectB.width);
  const top = Math.max(rectA.y, rectB.y);
  const bottom = Math.min(rectA.y + rectA.height, rectB.y + rectB.height);

  if (right <= left || bottom <= top) {
    return false;
  }

  if (minOverlapRatio <= 0) {
    return true;
  }

  const overlapArea = (right - left) * (bottom - top);
  const rectAArea = rectA.width * rectA.height;
  return overlapArea / rectAArea >= minOverlapRatio;
}

/**
 * Clamps a number within a specified minimum and maximum boundary.
 */
export function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(val, max));
}
