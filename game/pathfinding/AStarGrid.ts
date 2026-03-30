interface Point {
  x: number;
  y: number;
}

interface Node {
  x: number;
  y: number;
  g: number;
  h: number;
  f: number;
  parent: Node | null;
}

export class AStarGrid {
  private blocked: Set<string>;

  constructor(
    private cols: number,
    private rows: number,
    blockedTiles: [number, number][]
  ) {
    this.blocked = new Set(blockedTiles.map(([x, y]) => `${x},${y}`));
  }

  isBlocked(x: number, y: number): boolean {
    return this.blocked.has(`${x},${y}`);
  }

  setBlocked(x: number, y: number, blocked: boolean): void {
    const key = `${x},${y}`;
    if (blocked) this.blocked.add(key);
    else this.blocked.delete(key);
  }

  findPath(startX: number, startY: number, endX: number, endY: number): Point[] | null {
    if (startX === endX && startY === endY) {
      return [{ x: startX, y: startY }];
    }

    if (this.isBlocked(endX, endY)) return null;

    const open: Node[] = [];
    const closed = new Set<string>();

    const heuristic = (x: number, y: number) =>
      Math.abs(x - endX) + Math.abs(y - endY);

    const startNode: Node = {
      x: startX,
      y: startY,
      g: 0,
      h: heuristic(startX, startY),
      f: heuristic(startX, startY),
      parent: null,
    };
    open.push(startNode);

    const dirs = [
      [0, -1], [0, 1], [-1, 0], [1, 0],
      [-1, -1], [-1, 1], [1, -1], [1, 1],
    ];

    while (open.length > 0) {
      let lowestIdx = 0;
      for (let i = 1; i < open.length; i++) {
        if (open[i].f < open[lowestIdx].f) lowestIdx = i;
      }
      const current = open.splice(lowestIdx, 1)[0];

      if (current.x === endX && current.y === endY) {
        const path: Point[] = [];
        let node: Node | null = current;
        while (node) {
          path.unshift({ x: node.x, y: node.y });
          node = node.parent;
        }
        return path;
      }

      closed.add(`${current.x},${current.y}`);

      for (const [dx, dy] of dirs) {
        const nx = current.x + dx;
        const ny = current.y + dy;

        if (nx < 0 || nx >= this.cols || ny < 0 || ny >= this.rows) continue;
        if (closed.has(`${nx},${ny}`)) continue;
        if (this.isBlocked(nx, ny)) continue;

        if (dx !== 0 && dy !== 0) {
          if (this.isBlocked(current.x + dx, current.y) || this.isBlocked(current.x, current.y + dy)) {
            continue;
          }
        }

        const g = current.g + (dx !== 0 && dy !== 0 ? 1.414 : 1);
        const h = heuristic(nx, ny);
        const f = g + h;

        const existing = open.find((n) => n.x === nx && n.y === ny);
        if (existing) {
          if (g < existing.g) {
            existing.g = g;
            existing.f = f;
            existing.parent = current;
          }
        } else {
          open.push({ x: nx, y: ny, g, h, f, parent: current });
        }
      }
    }

    return null;
  }
}
