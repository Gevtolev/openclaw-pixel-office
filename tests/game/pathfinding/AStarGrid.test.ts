import { describe, it, expect } from 'vitest';
import { AStarGrid } from '@/game/pathfinding/AStarGrid';

describe('AStarGrid', () => {
  it('finds a straight-line path on an empty grid', () => {
    const grid = new AStarGrid(10, 10, []);
    const path = grid.findPath(0, 0, 5, 0);
    expect(path).not.toBeNull();
    expect(path!.length).toBeGreaterThan(0);
    expect(path![path!.length - 1]).toEqual({ x: 5, y: 0 });
  });

  it('navigates around obstacles', () => {
    const blocked: [number, number][] = [];
    for (let y = 0; y < 10; y++) {
      if (y !== 5) blocked.push([3, y]);
    }
    const grid = new AStarGrid(10, 10, blocked);
    const path = grid.findPath(0, 0, 5, 0);
    expect(path).not.toBeNull();
    expect(path!.some((p) => p.y === 5)).toBe(true);
  });

  it('returns null when no path exists', () => {
    const blocked: [number, number][] = [];
    for (let y = 0; y < 10; y++) blocked.push([3, y]);
    const grid = new AStarGrid(10, 10, blocked);
    const path = grid.findPath(0, 0, 5, 0);
    expect(path).toBeNull();
  });

  it('returns single-step path when start equals goal', () => {
    const grid = new AStarGrid(10, 10, []);
    const path = grid.findPath(3, 3, 3, 3);
    expect(path).toEqual([{ x: 3, y: 3 }]);
  });
});
