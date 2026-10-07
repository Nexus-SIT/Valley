/**
 * Isometric A* Pathfinding for Valley Campus Map.
 *
 * Features:
 * - 8-directional movement (N, S, E, W, NE, NW, SE, SW)
 * - True Octile heuristic with diagonal cost √2 (~1.414)
 * - Corner-cutting prevention (cannot cut diagonally across obstacle corners)
 * - Path smoothing (Raycast line-of-sight test to remove zig-zags across open areas)
 * - Fallback to nearest walkable tile when clicking an obstacle
 */

class MinHeap {
  constructor() {
    this.heap = [];
  }

  push(node) {
    this.heap.push(node);
    this._bubbleUp(this.heap.length - 1);
  }

  pop() {
    if (this.heap.length === 0) return null;
    const top = this.heap[0];
    const bottom = this.heap.pop();
    if (this.heap.length > 0) {
      this.heap[0] = bottom;
      this._sinkDown(0);
    }
    return top;
  }

  isEmpty() {
    return this.heap.length === 0;
  }

  _bubbleUp(idx) {
    const element = this.heap[idx];
    while (idx > 0) {
      const parentIdx = (idx - 1) >> 1;
      const parent = this.heap[parentIdx];
      if (element.f >= parent.f) break;
      this.heap[idx] = parent;
      idx = parentIdx;
    }
    this.heap[idx] = element;
  }

  _sinkDown(idx) {
    const length = this.heap.length;
    const element = this.heap[idx];
    while (true) {
      const leftIdx = (idx << 1) + 1;
      const rightIdx = leftIdx + 1;
      let swapIdx = -1;
      let minF = element.f;

      if (leftIdx < length && this.heap[leftIdx].f < minF) {
        swapIdx = leftIdx;
        minF = this.heap[leftIdx].f;
      }

      if (rightIdx < length && this.heap[rightIdx].f < minF) {
        swapIdx = rightIdx;
      }

      if (swapIdx === -1) break;
      this.heap[idx] = this.heap[swapIdx];
      idx = swapIdx;
    }
    this.heap[idx] = element;
  }
}

export default class IsoPathfinder {
  /**
   * @param {number} cols - Grid column count
   * @param {number} rows - Grid row count
   * @param {Function} isWalkableFn - (col, row) => boolean
   */
  constructor(cols, rows, isWalkableFn) {
    this.cols = cols;
    this.rows = rows;
    this.isWalkableFn = isWalkableFn;
    this.SQRT2 = Math.SQRT2;
  }

  isWalkable(col, row) {
    if (col < 0 || row < 0 || col >= this.cols || row >= this.rows) return false;
    return this.isWalkableFn(col, row);
  }

  /**
   * Octile distance heuristic for 8-way movement
   */
  heuristic(c1, r1, c2, r2) {
    const dx = Math.abs(c1 - c2);
    const dy = Math.abs(r1 - r2);
    // (dx + dy) + (sqrt(2) - 2) * min(dx, dy)
    return (dx + dy) + (this.SQRT2 - 2) * Math.min(dx, dy);
  }

  /**
   * Finds the closest walkable tile within search radius if target is blocked.
   */
  findNearestWalkable(targetCol, targetRow, maxRadius = 4) {
    if (this.isWalkable(targetCol, targetRow)) {
      return { col: targetCol, row: targetRow };
    }

    let bestTile = null;
    let minDistance = Infinity;

    for (let r = 1; r <= maxRadius; r++) {
      for (let dc = -r; dc <= r; dc++) {
        for (let dr = -r; dr <= r; dr++) {
          if (Math.abs(dc) !== r && Math.abs(dr) !== r) continue;
          const c = targetCol + dc;
          const row = targetRow + dr;
          if (this.isWalkable(c, row)) {
            const dist = Math.hypot(dc, dr);
            if (dist < minDistance) {
              minDistance = dist;
              bestTile = { col: c, row };
            }
          }
        }
      }
      if (bestTile) break; // Found nearest in ring r
    }

    return bestTile;
  }

  /**
   * Computes shortest path from (startCol, startRow) to (endCol, endRow).
   * Returns array of waypoints: [{ col, row }, ...] or [] if no path.
   */
  findPath(startCol, startRow, endCol, endRow) {
    const sCol = Math.round(startCol);
    const sRow = Math.round(startRow);
    let eCol = Math.round(endCol);
    let eRow = Math.round(endRow);

    // If destination is blocked, find closest walkable
    if (!this.isWalkable(eCol, eRow)) {
      const nearest = this.findNearestWalkable(eCol, eRow);
      if (!nearest) return [];
      eCol = nearest.col;
      eRow = nearest.row;
    }

    if (sCol === eCol && sRow === eRow) {
      return [{ col: eCol + 0.5, row: eRow + 0.5 }];
    }

    const openHeap = new MinHeap();
    const gScores = new Map();
    const parents = new Map();
    const closed = new Set();

    const key = (c, r) => `${c},${r}`;
    const startKey = key(sCol, sRow);

    gScores.set(startKey, 0);
    openHeap.push({
      col: sCol,
      row: sRow,
      g: 0,
      f: this.heuristic(sCol, sRow, eCol, eRow),
    });

    // 8-directional offsets
    const directions = [
      // Cardinal (cost 1.0)
      { dc: 0,  dr: -1, cost: 1.0 },
      { dc: 0,  dr: 1,  cost: 1.0 },
      { dc: -1, dr: 0,  cost: 1.0 },
      { dc: 1,  dr: 0,  cost: 1.0 },
      // Diagonal (cost sqrt(2) ~ 1.414)
      { dc: -1, dr: -1, cost: this.SQRT2, isDiag: true },
      { dc: 1,  dr: -1, cost: this.SQRT2, isDiag: true },
      { dc: -1, dr: 1,  cost: this.SQRT2, isDiag: true },
      { dc: 1,  dr: 1,  cost: this.SQRT2, isDiag: true },
    ];

    let foundTarget = false;

    while (!openHeap.isEmpty()) {
      const current = openHeap.pop();
      const currKey = key(current.col, current.row);

      if (current.col === eCol && current.row === eRow) {
        foundTarget = true;
        break;
      }

      if (closed.has(currKey)) continue;
      closed.add(currKey);

      for (const dir of directions) {
        const nextCol = current.col + dir.dc;
        const nextRow = current.row + dir.dr;

        if (!this.isWalkable(nextCol, nextRow)) continue;

        // Prevent corner cutting on diagonals
        if (dir.isDiag) {
          const card1Walkable = this.isWalkable(current.col + dir.dc, current.row);
          const card2Walkable = this.isWalkable(current.col, current.row + dir.dr);
          if (!card1Walkable || !card2Walkable) {
            continue; // Can't squeeze through diagonal wall corner
          }
        }

        const nextKey = key(nextCol, nextRow);
        if (closed.has(nextKey)) continue;

        const tentativeG = current.g + dir.cost;
        const currentG = gScores.get(nextKey);

        if (currentG === undefined || tentativeG < currentG) {
          gScores.set(nextKey, tentativeG);
          parents.set(nextKey, { col: current.col, row: current.row });

          const h = this.heuristic(nextCol, nextRow, eCol, eRow);
          // Slight tie-breaker to favor straight paths
          const f = tentativeG + h * 1.001;

          openHeap.push({
            col: nextCol,
            row: nextRow,
            g: tentativeG,
            f,
          });
        }
      }
    }

    if (!foundTarget) return [];

    // Reconstruct raw tile path
    const rawPath = [];
    let curr = { col: eCol, row: eRow };
    while (curr) {
      rawPath.push({ col: curr.col + 0.5, row: curr.row + 0.5 });
      if (curr.col === sCol && curr.row === sRow) break;
      curr = parents.get(key(curr.col, curr.row));
    }
    rawPath.reverse();

    // Smooth path using raycast line-of-sight test
    return this.smoothPath(rawPath);
  }

  /**
   * Raycasts between two points to test if a straight line passes through only walkable space.
   */
  hasLineOfSight(p1, p2) {
    const steps = Math.ceil(Math.hypot(p2.col - p1.col, p2.row - p1.row) * 4);
    if (steps <= 1) return true;

    for (let i = 1; i < steps; i++) {
      const t = i / steps;
      const c = p1.col + (p2.col - p1.col) * t;
      const r = p1.row + (p2.row - p1.row) * t;

      // Check current cell and immediate boundary clearance
      const tileCol = Math.floor(c);
      const tileRow = Math.floor(r);

      if (!this.isWalkable(tileCol, tileRow)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Path smoothing (String pulling / shortcutting).
   * Replaces intermediate zig-zags with direct line segments where line-of-sight is clear.
   */
  smoothPath(path) {
    if (path.length <= 2) return path;

    const smoothed = [path[0]];
    let currentIdx = 0;

    while (currentIdx < path.length - 1) {
      let nextIdx = path.length - 1;
      // Look ahead from farthest down to next immediate
      while (nextIdx > currentIdx + 1) {
        if (this.hasLineOfSight(path[currentIdx], path[nextIdx])) {
          break; // Found furthest reachable node
        }
        nextIdx--;
      }

      smoothed.push(path[nextIdx]);
      currentIdx = nextIdx;
    }

    return smoothed;
  }
}
