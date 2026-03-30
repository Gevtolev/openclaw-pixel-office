import { AStarGrid } from './AStarGrid';
import { GRID_COLS, GRID_ROWS, TILE_SIZE } from '@/game/config/layout';

const DEFAULT_BLOCKED: [number, number][] = [];

const FURNITURE_BOUNDS = [
  { x1: 5, y1: 12, x2: 9, y2: 14 },
  { x1: 20, y1: 3, x2: 25, y2: 5 },
  { x1: 30, y1: 3, x2: 35, y2: 6 },
  { x1: 0, y1: 0, x2: 39, y2: 2 },
];

for (const bound of FURNITURE_BOUNDS) {
  for (let x = bound.x1; x <= bound.x2; x++) {
    for (let y = bound.y1; y <= bound.y2; y++) {
      DEFAULT_BLOCKED.push([x, y]);
    }
  }
}

export function createCollisionMap(): AStarGrid {
  return new AStarGrid(GRID_COLS, GRID_ROWS, DEFAULT_BLOCKED);
}

export function pixelToTile(px: number, py: number): { tx: number; ty: number } {
  return {
    tx: Math.floor(px / TILE_SIZE),
    ty: Math.floor(py / TILE_SIZE),
  };
}

export function tileToPixel(tx: number, ty: number): { px: number; py: number } {
  return {
    px: tx * TILE_SIZE + TILE_SIZE / 2,
    py: ty * TILE_SIZE + TILE_SIZE / 2,
  };
}
