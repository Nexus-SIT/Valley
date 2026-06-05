import { mapGrid, TILE_SIZE, isSolid, NEXUS_DOOR } from './mapData';

// Player size
export const PLAYER_SIZE = 24;
export const PLAYER_SPEED = 3;

export class GameEngine {
  constructor(startX, startY, onInteract) {
    this.player = {
      x: startX,
      y: startY,
      width: PLAYER_SIZE,
      height: PLAYER_SIZE,
      color: '#ffeb3b', // simple yellow square player
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
    // Collision box corners
    const left = newX;
    const right = newX + this.player.width;
    const top = newY;
    const bottom = newY + this.player.height;

    // Map boundaries
    if (left < 0 || right > mapGrid[0].length * TILE_SIZE || top < 0 || bottom > mapGrid.length * TILE_SIZE) {
      return true; // Collided with edge of world
    }

    // Check tiles under the 4 corners of the player
    const tilesToCheck = [
      { col: Math.floor(left / TILE_SIZE), row: Math.floor(top / TILE_SIZE) },
      { col: Math.floor(right / TILE_SIZE), row: Math.floor(top / TILE_SIZE) },
      { col: Math.floor(left / TILE_SIZE), row: Math.floor(bottom / TILE_SIZE) },
      { col: Math.floor(right / TILE_SIZE), row: Math.floor(bottom / TILE_SIZE) },
    ];

    for (let tile of tilesToCheck) {
      if (tile.row >= 0 && tile.row < mapGrid.length && tile.col >= 0 && tile.col < mapGrid[0].length) {
        const tileType = mapGrid[tile.row][tile.col];
        if (isSolid(tileType)) {
          return true; // Collision detected
        }
      }
    }

    return false;
  };

  checkInteraction = () => {
    // Simple logic: if player is near the Nexus door
    const centerCol = Math.floor((this.player.x + this.player.width / 2) / TILE_SIZE);
    const centerRow = Math.floor((this.player.y + this.player.height / 2) / TILE_SIZE);

    // If standing right below or on the Nexus door
    if (Math.abs(centerCol - NEXUS_DOOR.col) <= 1 && Math.abs(centerRow - NEXUS_DOOR.row) <= 1) {
      if (this.onInteract) {
        this.onInteract();
      }
    }
  };
}
