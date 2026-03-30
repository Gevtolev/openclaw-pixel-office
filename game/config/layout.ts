export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;

export const TILE_SIZE = 32;
export const GRID_COLS = Math.floor(GAME_WIDTH / TILE_SIZE); // 40
export const GRID_ROWS = Math.floor(GAME_HEIGHT / TILE_SIZE); // 22

export const ZONES = {
  door: { x: 640, y: 550 },
  writing: { x: 320, y: 360 },
  error: { x: 1066, y: 180 },
  breakroom: { x: 640, y: 360 },
} as const;

export const FURNITURE = {
  sofa: { x: 670, y: 144, depth: 10, originX: 0, originY: 0 },
  desk: { x: 218, y: 417, depth: 1000 },
  flower: { x: 310, y: 390, depth: 1100, scale: 0.8 },
  starWorking: { x: 217, y: 333, depth: 900, scale: 1.32 },
  coffeeMachine: { x: 659, y: 397, depth: 99 },
  serverroom: { x: 1021, y: 142, depth: 2 },
  errorBug: { x: 1007, y: 221, depth: 50, scale: 0.9 },
  syncAnim: { x: 1157, y: 592, depth: 40 },
  cat: { x: 94, y: 557, depth: 2000 },
  plants: [
    { x: 565, y: 178, depth: 5 },
    { x: 230, y: 185, depth: 5 },
    { x: 977, y: 496, depth: 5 },
  ],
} as const;

export const SEATS = [
  { id: 'seat-main', x: 217, y: 360, reserved: 'primary' },
  { id: 'seat-1', x: 280, y: 360, reserved: null },
  { id: 'seat-2', x: 340, y: 360, reserved: null },
  { id: 'seat-3', x: 400, y: 360, reserved: null },
  { id: 'seat-4', x: 280, y: 420, reserved: null },
  { id: 'seat-5', x: 340, y: 420, reserved: null },
  { id: 'seat-6', x: 400, y: 420, reserved: null },
] as const;

export const NAMEPLATE = {
  x: 640,
  y: 684,
  width: 420,
  height: 44,
} as const;
