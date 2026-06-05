import { REGIONS, MAP_WIDTH, MAP_HEIGHT, NEXUS_DOOR_BOX } from './mapData';

// Tiny player size to match map scale
export const PLAYER_WIDTH = 16;
export const PLAYER_HEIGHT = 24;
export const PLAYER_SPEED = 4;

export class GameEngine {
  constructor(startX, startY, onInteract) {
    this.player = {
      x: startX,
      y: startY,
      width: PLAYER_WIDTH,
      height: PLAYER_HEIGHT,
      color: '#ffeb3b', // simple yellow player
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

    // AABB Collision with solid regions
    for (let region of REGIONS) {
      if (region.solid) {
        if (
          right > region.x &&
          left < region.x + region.w &&
          bottom > region.y &&
          top < region.y + region.h
        ) {
          return true; // Collided
        }
      }
    }

    return false;
  };

  checkInteraction = () => {
    // Check intersection with Nexus door box
    const left = this.player.x;
    const right = this.player.x + this.player.width;
    const top = this.player.y;
    const bottom = this.player.y + this.player.height;

    const b = NEXUS_DOOR_BOX;

    // AABB check
    if (
      right > b.x &&
      left < b.x + b.w &&
      bottom > b.y &&
      top < b.y + b.h
    ) {
      if (this.onInteract) {
        this.onInteract();
      }
    }
  };
}
