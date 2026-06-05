export const MAP_WIDTH = 2000;
export const MAP_HEIGHT = 2000;

export const REGIONS = [
  // Background grass (Base layer)
  { type: 'grass', x: 0, y: 0, w: MAP_WIDTH, h: MAP_HEIGHT, color: '#518b38', solid: false },
  
  // --- DIRT PATHS ---
  // Left main path
  { type: 'path', x: 280, y: 0, w: 120, h: MAP_HEIGHT, color: '#c49a6c', solid: false },
  // Bottom main path
  { type: 'path', x: 280, y: 1500, w: 1500, h: 120, color: '#c49a6c', solid: false },
  // Path around garden
  { type: 'path', x: 500, y: 600, w: 1000, h: 60, color: '#c49a6c', solid: false }, // top garden path
  { type: 'path', x: 1400, y: 600, w: 80, h: 900, color: '#c49a6c', solid: false }, // right garden path
  
  // Central path leading to Pharmacy (Nexus)
  { type: 'path', x: 800, y: 500, w: 300, h: 200, color: '#b5a18c', solid: false }, // paved entrance
  { type: 'path', x: 920, y: 700, w: 60, h: 800, color: '#b5a18c', solid: false }, // center paved walkway

  // --- CENTRAL GARDEN ---
  { type: 'garden', x: 500, y: 660, w: 900, h: 840, color: '#449e35', solid: false },

  // --- BUILDINGS (Solid) ---
  // Left: Institute of Sciences
  { type: 'building', id: 'institute', x: 50, y: 500, w: 200, h: 900, color: '#888f96', solid: true },
  
  // Top: Srinivas College Of Pharmacy (NEXUS)
  { type: 'building', id: 'pharmacy', x: 450, y: 100, w: 1000, h: 400, color: '#68829e', solid: true },
  // Pharmacy solar panels / roof details (non-solid, just visual overlay on building)
  { type: 'detail', x: 450, y: 350, w: 1000, h: 100, color: '#4a5d73', solid: false },
  
  // Bottom: Srinivasa Temple
  { type: 'building', id: 'temple', x: 800, y: 1650, w: 500, h: 250, color: '#d6a058', solid: true },
  
  // Right: Walkway structure
  { type: 'building', id: 'right_walkway', x: 1600, y: 400, w: 150, h: 1400, color: '#a3a09b', solid: true },

  // --- TREES / VEGETATION (Solid boundaries) ---
  // Dense forest on the far left
  { type: 'tree', x: 0, y: 0, w: 250, h: MAP_HEIGHT, color: '#27521c', solid: true },
  // Dense forest top right
  { type: 'tree', x: 1500, y: 0, w: 500, h: 400, color: '#27521c', solid: true },
  // Dense forest far right
  { type: 'tree', x: 1800, y: 400, w: 200, h: 1600, color: '#27521c', solid: true },
];

// Spawn point (bottom left on the dirt path)
export const SPAWN_X = 320;
export const SPAWN_Y = 1800;

// Nexus Interaction Box (Front doors of the Pharmacy building)
// The building is at x: 450, y: 100, w: 1000, h: 400
// The entrance is around x: 900 to 1000, y: 500 (just below the building)
export const NEXUS_DOOR_BOX = {
  x: 900,
  y: 490,
  w: 100,
  h: 50
};
