import { REGIONS, MAP_WIDTH, MAP_HEIGHT, NEXUS_DOOR_BOX, SIGN_BOX } from './mapData';

// Tiny player size to match map scale
export const PLAYER_WIDTH = 16;
export const PLAYER_HEIGHT = 24;
export const PLAYER_SPEED = 2;

export class GameEngine {
  constructor(startX, startY, onInteract) {
    this.player = {
      x: startX,
      y: startY,
      width: PLAYER_WIDTH,
      height: PLAYER_HEIGHT,
      color: '#ffeb3b', // simple yellow player
      isMoving: false,
      direction: 'down', // 'down', 'up', 'left', 'right'
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
    if (Object.prototype.hasOwnProperty.call(this.keys, e.key)) {
      this.keys[e.key] = true;
    }
    if (e.key === 'e' || e.key === 'E' || e.key === ' ') {
      this.checkInteraction();
    }
  };

  handleKeyUp = (e) => {
    if (Object.prototype.hasOwnProperty.call(this.keys, e.key)) {
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
      if (this.player.animTimer >= 8) { // 8 ticks per frame
        this.player.animTimer = 0;
        this.player.animFrame = (this.player.animFrame + 1) % 4;
      }
    } else {
      this.player.isMoving = false;
      this.player.animTimer = 0;
      this.player.animFrame = 0; // Reset to 'STAND' frame
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
    const left = this.player.x;
    const right = this.player.x + this.player.width;
    const top = this.player.y;
    const bottom = this.player.y + this.player.height;

    const isIntersecting = (b) => {
      return (
        right > b.x &&
        left < b.x + b.w &&
        bottom > b.y &&
        top < b.y + b.h
      );
    };

    if (isIntersecting(NEXUS_DOOR_BOX)) {
      if (this.onInteract) this.onInteract('nexus');
    } else if (isIntersecting(SIGN_BOX)) {
      if (this.onInteract) this.onInteract('github_sign');
    }
  };
}
