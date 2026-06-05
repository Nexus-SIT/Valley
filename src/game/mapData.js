export const TILE_SIZE = 40;
export const MAP_COLS = 20;
export const MAP_ROWS = 15;

// 0: grass, 1: path, 2: boundary/tree, 3: generic building, 4: Nexus building
export const mapGrid = [
  [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
  [2, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
  [2, 0, 3, 3, 0, 0, 0, 0, 2, 0, 0, 4, 4, 4, 0, 0, 0, 0, 0, 2],
  [2, 0, 3, 3, 0, 0, 0, 0, 2, 0, 0, 4, 4, 4, 0, 0, 3, 3, 0, 2],
  [2, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 3, 3, 0, 2],
  [2, 2, 2, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 2],
  [2, 0, 0, 0, 0, 0, 1, 0, 0, 3, 3, 0, 1, 0, 0, 0, 0, 0, 0, 2],
  [2, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 2, 2, 2, 0, 2],
  [2, 0, 3, 3, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 2, 0, 2],
  [2, 0, 3, 3, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 2, 0, 2],
  [2, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
  [2, 0, 0, 0, 0, 0, 1, 0, 0, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 2],
  [2, 0, 0, 0, 0, 0, 1, 0, 0, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 2],
  [2, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
  [2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
];

// Spawn point (campus gate at bottom)
export const SPAWN_X = 6 * TILE_SIZE;
export const SPAWN_Y = 13 * TILE_SIZE;

// Colors for rendering map tiles
export const TILE_COLORS = {
  0: '#7ec850', // grass
  1: '#d2b48c', // dirt path
  2: '#228b22', // trees/boundaries
  3: '#8b4513', // brick generic building
  4: '#4169e1', // Nexus building (blueish modern)
};

// Check if a given tile type is solid (blocks movement)
export const isSolid = (tileType) => {
  return tileType === 2 || tileType === 3 || tileType === 4;
};

// Nexus Interaction Box (where the player can trigger the modal)
// We'll define the door of the Nexus building roughly at the bottom center of the blue block
// Nexus block spans x:11..13, y:2..3. Door could be below x=12, y=3
export const NEXUS_DOOR = {
  col: 12,
  row: 4,
};
