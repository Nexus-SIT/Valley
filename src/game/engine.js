import { COLLISION_OBJECTS, MAP_WIDTH, MAP_HEIGHT, NEXUS_DOOR_BOX, SIGN_BOX } from './mapData';

// Tiny player size to match map scale (16x16 tile grid)
export const PLAYER_WIDTH = 14;
export const PLAYER_HEIGHT = 16;
export const PLAYER_SPEED = 2.5;

function pointInPolygon(px, py, vertices) {
  let inside = false;
  for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
    const xi = vertices[i].x, yi = vertices[i].y;
    const xj = vertices[j].x, yj = vertices[j].y;
    const intersect = ((yi > py) !== (yj > py)) &&
        (px < (xj - xi) * (py - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

function lineIntersects(p1x, p1y, p2x, p2y, p3x, p3y, p4x, p4y) {
  function ccw(ax, ay, bx, by, cx, cy) {
    return (cy - ay) * (bx - ax) > (by - ay) * (cx - ax);
  }
  return (ccw(p1x, p1y, p3x, p3y, p4x, p4y) !== ccw(p2x, p2y, p3x, p3y, p4x, p4y)) &&
         (ccw(p1x, p1y, p2x, p2y, p3x, p3y) !== ccw(p1x, p1y, p2x, p2y, p4x, p4y));
}

function aabbPolygonOverlap(left, right, top, bottom, vertices) {
  // 1. Polygon Bounding box quick check
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (let i = 0; i < vertices.length; i++) {
    const v = vertices[i];
    if (v.x < minX) minX = v.x;
    if (v.x > maxX) maxX = v.x;
    if (v.y < minY) minY = v.y;
    if (v.y > maxY) maxY = v.y;
  }
  if (right < minX || left > maxX || bottom < minY || top > maxY) {
    return false;
  }

  // 2. Check if any corner of player AABB is inside polygon
  if (pointInPolygon(left, top, vertices) ||
      pointInPolygon(right, top, vertices) ||
      pointInPolygon(left, bottom, vertices) ||
      pointInPolygon(right, bottom, vertices)) {
    return true;
  }

  // 3. Check if any vertex of polygon is inside player AABB
  for (let i = 0; i < vertices.length; i++) {
    const v = vertices[i];
    if (v.x >= left && v.x <= right && v.y >= top && v.y <= bottom) {
      return true;
    }
  }

  // 4. Check if any edge of player AABB intersects any edge of polygon
  const boxEdges = [
    [left, top, right, top],
    [right, top, right, bottom],
    [right, bottom, left, bottom],
    [left, bottom, left, top]
  ];

  for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
    const v1 = vertices[i];
    const v2 = vertices[j];
    for (let k = 0; k < 4; k++) {
      const e = boxEdges[k];
      if (lineIntersects(e[0], e[1], e[2], e[3], v1.x, v1.y, v2.x, v2.y)) {
        return true;
      }
    }
  }

  return false;
}

export class GameEngine {
  constructor(startX, startY, onInteract) {
    this.player = {
      x: startX,
      y: startY,
      width: PLAYER_WIDTH,
      height: PLAYER_HEIGHT,
      color: '#ffeb3b',
      isMoving: false,
      direction: 'down',
      animFrame: 0,
      animTimer: 0,
    };
    
    this.keys = {
      w: false,
      a: false,
      s: false,
      d: false,
      ArrowUp: false,
      ArrowLeft: false,
      ArrowDown: false,
      ArrowRight: false,
    };

    this.onInteract = onInteract;
  }

  handleKeyDown = (e) => {
    if (this.keys.hasOwnProperty(e.key)) {
      this.keys[e.key] = true;
    }
    if (e.key === 'e' || e.key === 'E' || e.key === ' ') {
      this.checkInteraction();
    }
  };

  handleKeyUp = (e) => {
    if (this.keys.hasOwnProperty(e.key)) {
      this.keys[e.key] = false;
    }
  };

  update = () => {
    let dx = 0;
    let dy = 0;

    if (this.keys.w || this.keys.ArrowUp) dy -= PLAYER_SPEED;
    if (this.keys.s || this.keys.ArrowDown) dy += PLAYER_SPEED;
    if (this.keys.a || this.keys.ArrowLeft) dx -= PLAYER_SPEED;
    if (this.keys.d || this.keys.ArrowRight) dx += PLAYER_SPEED;

    // Normalize diagonal movement
    if (dx !== 0 && dy !== 0) {
      const length = Math.sqrt(dx * dx + dy * dy);
      dx = (dx / length) * PLAYER_SPEED;
      dy = (dy / length) * PLAYER_SPEED;
    }

    if (dx !== 0 || dy !== 0) {
      this.movePlayer(dx, dy);
      
      // Update direction based on primary movement axis
      if (Math.abs(dx) > Math.abs(dy)) {
        this.player.direction = dx > 0 ? 'right' : 'left';
      } else {
        this.player.direction = dy > 0 ? 'down' : 'up';
      }

      this.player.isMoving = true;
      this.player.animTimer++;
      if (this.player.animTimer >= 8) {
        this.player.animTimer = 0;
        this.player.animFrame = (this.player.animFrame + 1) % 4;
      }
    } else {
      this.player.isMoving = false;
      this.player.animTimer = 0;
      this.player.animFrame = 0;
    }
  };

  movePlayer = (dx, dy) => {
    // Check X movement
    if (dx !== 0) {
      if (!this.checkCollision(this.player.x + dx, this.player.y)) {
        this.player.x += dx;
      }
    }
    // Check Y movement
    if (dy !== 0) {
      if (!this.checkCollision(this.player.x, this.player.y + dy)) {
        this.player.y += dy;
      }
    }
  };

  checkCollision = (newX, newY) => {
    const left = newX;
    const right = newX + this.player.width;
    const top = newY;
    const bottom = newY + this.player.height;

    // Map boundaries
    if (left < 0 || right > MAP_WIDTH || top < 0 || bottom > MAP_HEIGHT) {
      return true;
    }

    // Collisions with Tiled Object Layer shapes
    for (let obj of COLLISION_OBJECTS) {
      if (obj.type === 'polygon' && obj.vertices) {
        if (aabbPolygonOverlap(left, right, top, bottom, obj.vertices)) {
          return true;
        }
      } else if (obj.type === 'rect') {
        if (
          right > obj.x &&
          left < obj.x + obj.w &&
          bottom > obj.y &&
          top < obj.y + obj.h
        ) {
          return true;
        }
      }
    }

    return false;
  };

  checkInteraction = () => {
    const left = this.player.x;
    const right = this.player.x + this.player.width;
    const top = this.player.y;
    const bottom = this.player.y + this.player.height;

    const isIntersecting = (b) => {
      // Add slight interaction padding (e.g. 20px) around player
      const pad = 20;
      return (
        right + pad > b.x &&
        left - pad < b.x + b.w &&
        bottom + pad > b.y &&
        top - pad < b.y + b.h
      );
    };

    if (isIntersecting(NEXUS_DOOR_BOX)) {
      if (this.onInteract) this.onInteract('nexus');
    } else if (isIntersecting(SIGN_BOX)) {
      if (this.onInteract) this.onInteract('github_sign');
    }
  };
}
