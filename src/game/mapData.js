import mapRaw from '../../Map/map.json';
import ts1Src from '../assets/tilesets/ts1.png';
import ts2Src from '../assets/tilesets/ts2.png';

export const TILE_WIDTH = mapRaw.tilewidth || 16;
export const TILE_HEIGHT = mapRaw.tileheight || 16;
export const MAP_COLS = mapRaw.width || 120;
export const MAP_ROWS = mapRaw.height || 100;
export const MAP_WIDTH = MAP_COLS * TILE_WIDTH;
export const MAP_HEIGHT = MAP_ROWS * TILE_HEIGHT;

// Extract Tile Layer 1 data
const tileLayer = mapRaw.layers.find(l => l.name === 'Tile Layer 1' || l.type === 'tilelayer');
export const TILE_DATA = tileLayer ? tileLayer.data : [];

// Tileset metadata with imported asset URLs
export const TILESETS = [
  {
    name: 'ts1',
    firstgid: 1,
    tilecount: 6090,
    columns: 87,
    tilewidth: 16,
    tileheight: 16,
    src: ts1Src
  },
  {
    name: 'ts2',
    firstgid: 6091,
    tilecount: 6090,
    columns: 87,
    tilewidth: 16,
    tileheight: 16,
    src: ts2Src
  }
];

// Extract collision polygons and objects from Object Layer 1
const objectLayer = mapRaw.layers.find(l => l.name === 'Object Layer 1' || l.type === 'objectgroup');
export const COLLISION_OBJECTS = objectLayer && objectLayer.objects ? objectLayer.objects.map(obj => {
  if (obj.polygon && obj.polygon.length > 0) {
    return {
      id: obj.id,
      name: obj.name,
      type: 'polygon',
      x: obj.x,
      y: obj.y,
      vertices: obj.polygon.map(pt => ({
        x: obj.x + pt.x,
        y: obj.y + pt.y
      }))
    };
  } else if (obj.width && obj.height) {
    return {
      id: obj.id,
      name: obj.name,
      type: 'rect',
      x: obj.x,
      y: obj.y,
      w: obj.width,
      h: obj.height
    };
  }
  return null;
}).filter(Boolean) : [];

// Spawn point (on the walkway, outside collision polygon)
export const SPAWN_X = 620;
export const SPAWN_Y = 800;

// Nexus Interaction Box (Building Entrance Door)
export const NEXUS_DOOR_BOX = {
  x: 450,
  y: 830,
  w: 60,
  h: 40
};

// GitHub Sign Interaction Box
export const SIGN_BOX = {
  x: 640,
  y: 820,
  w: 40,
  h: 40
};
