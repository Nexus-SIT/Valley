import { REGIONS, MAP_WIDTH, MAP_HEIGHT, NEXUS_DOOR_BOX, SIGN_BOX } from './mapData';

export const PLAYER_WIDTH = 16;
export const PLAYER_HEIGHT = 24;

export const BASE_SPEED_PER_MS = 0.25;

export class GameEngine {
  constructor(startX, startY, onInteract) {
    this.player = {
      x: startX,
      y: startY,
      width: PLAYER_WIDTH,
      height: PLAYER_HEIGHT,
      color: '#ffeb3b',
      isMoving: false,
      direction: 'up',
      animFrame: 0,
      animTimer: 0,
    };
    
    this.keys = {
      w: false,
      a: false,
      s: false,
      d: false,
    };

    this.onInteract = onInteract;
  }

  handleKeyDown = (e) => {
    const code = e.code || '';
    const key = e.key ? e.key.toLowerCase() : '';

    if (code === 'KeyW' || code === 'ArrowUp' || key === 'w' || key === 'arrowup') this.keys.w = true;
    if (code === 'KeyS' || code === 'ArrowDown' || key === 's' || key === 'arrowdown') this.keys.s = true;
    if (code === 'KeyA' || code === 'ArrowLeft' || key === 'a' || key === 'arrowleft') this.keys.a = true;
    if (code === 'KeyD' || code === 'ArrowRight' || key === 'd' || key === 'arrowright') this.keys.d = true;

    if (code === 'KeyE' || code === 'Space' || key === 'e' || key === ' ') {
      this.checkInteraction();
    }
  };

  handleKeyUp = (e) => {
    const code = e.code || '';
    const key = e.key ? e.key.toLowerCase() : '';

    if (code === 'KeyW' || code === 'ArrowUp' || key === 'w' || key === 'arrowup') this.keys.w = false;
    if (code === 'KeyS' || code === 'ArrowDown' || key === 's' || key === 'arrowdown') this.keys.s = false;
    if (code === 'KeyA' || code === 'ArrowLeft' || key === 'a' || key === 'arrowleft') this.keys.a = false;
    if (code === 'KeyD' || code === 'ArrowRight' || key === 'd' || key === 'arrowright') this.keys.d = false;
  };

  update = (delta = 16.666) => {
    const safeDelta = Math.min(delta, 100);
    const speed = BASE_SPEED_PER_MS * safeDelta;

    let dx = 0;
    let dy = 0;

    if (this.keys.w) dy -= speed;
    if (this.keys.s) dy += speed;
    if (this.keys.a) dx -= speed;
    if (this.keys.d) dx += speed;

    if (dx !== 0 && dy !== 0) {
      const length = Math.sqrt(dx * dx + dy * dy);
      dx = (dx / length) * speed;
      dy = (dy / length) * speed;
    }

    if (dx !== 0 || dy !== 0) {
      this.movePlayer(dx, dy);
      
      if (Math.abs(dx) > Math.abs(dy)) {
        this.player.direction = dx > 0 ? 'right' : 'left';
      } else {
        this.player.direction = dy > 0 ? 'down' : 'up';
      }

      this.player.isMoving = true;
      this.player.animTimer += safeDelta;
      if (this.player.animTimer >= 100) {
        this.player.animTimer = 0;
        this.player.animFrame = (this.player.animFrame + 1) % 4;
      }
    } else {
      this.player.isMoving = false;
      this.player.animTimer = 0;
      this.player.animFrame = 0;
    }
  };

  // Sub-stepping movement for pixel-perfect smooth wall sliding (never gets stuck)
  movePlayer = (dx, dy) => {
    if (dx !== 0) {
      const steps = Math.max(1, Math.ceil(Math.abs(dx)));
      const stepX = dx / steps;
      for (let i = 0; i < steps; i++) {
        if (!this.checkCollision(this.player.x + stepX, this.player.y)) {
          this.player.x += stepX;
        } else {
          break; // Stop smoothly right at contact point
        }
      }
    }

    if (dy !== 0) {
      const steps = Math.max(1, Math.ceil(Math.abs(dy)));
      const stepY = dy / steps;
      for (let i = 0; i < steps; i++) {
        if (!this.checkCollision(this.player.x, this.player.y + stepY)) {
          this.player.y += stepY;
        } else {
          break; // Stop smoothly right at contact point
        }
      }
    }
  };

  teleportPlayer = (targetX, targetY) => {
    const clampedX = Math.max(10, Math.min(targetX, MAP_WIDTH - this.player.width - 10));
    const clampedY = Math.max(10, Math.min(targetY, MAP_HEIGHT - this.player.height - 10));
    
    this.player.x = clampedX;
    this.player.y = clampedY;
    this.player.isMoving = false;
  };

  checkCollision = (newX, newY) => {
    const left = newX + 2;
    const right = newX + 14;
    const top = newY + 14;
    const bottom = newY + 24;

    if (left < 0 || right > MAP_WIDTH || top < 0 || bottom > MAP_HEIGHT) {
      return true;
    }

    for (let region of REGIONS) {
      if (region.solid) {
        if (
          right > region.x &&
          left < region.x + region.w &&
          bottom > region.y &&
          top < region.y + region.h
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
