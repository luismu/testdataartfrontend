import { describe, expect, it } from 'vitest';
import { clamp, isIntersecting } from '../src/domain/collision';
import { Rect } from '../src/domain/types';

describe('Domain - Collision & Geometry', () => {
  it('correctly detects intersecting bounding boxes', () => {
    const rectA: Rect = { x: 50, y: 50, width: 100, height: 100 };
    const rectB: Rect = { x: 100, y: 100, width: 100, height: 100 };

    expect(isIntersecting(rectA, rectB)).toBe(true);
  });

  it('correctly detects non-intersecting separated bounding boxes', () => {
    const rectA: Rect = { x: 0, y: 0, width: 50, height: 50 };
    const rectB: Rect = { x: 100, y: 100, width: 50, height: 50 };

    expect(isIntersecting(rectA, rectB)).toBe(false);
  });

  it('returns false for adjacent/touching boxes without overlap', () => {
    const rectA: Rect = { x: 0, y: 0, width: 50, height: 50 };
    const rectB: Rect = { x: 50, y: 0, width: 50, height: 50 };

    expect(isIntersecting(rectA, rectB)).toBe(false);
  });

  it('evaluates minimum overlap ratio requirement', () => {
    const rectA: Rect = { x: 0, y: 0, width: 100, height: 100 }; // area: 10000
    // Overlap: x from 90 to 100 (10), y from 0 to 100 (100) -> area 1000 (10% overlap)
    const rectB: Rect = { x: 90, y: 0, width: 100, height: 100 };

    // With 0 threshold
    expect(isIntersecting(rectA, rectB, 0)).toBe(true);
    // With 5% threshold
    expect(isIntersecting(rectA, rectB, 0.05)).toBe(true);
    // With 20% threshold
    expect(isIntersecting(rectA, rectB, 0.2)).toBe(false);
  });

  it('clamps numbers within given bounds', () => {
    expect(clamp(150, 0, 100)).toBe(100);
    expect(clamp(-20, 0, 100)).toBe(0);
    expect(clamp(50, 0, 100)).toBe(50);
  });
});
