export const MAP_WIDTH = 2000;
export const MAP_HEIGHT = 2000;

// Corridor math verified:
//   Character collision: left=x+2, right=x+14, top=y+14, bottom=y+24
//
//   Corridor ABOVE admin/academic (below pharmacy):
//     pharmacy bottom = 845+125 = 970
//     admin top = 1040  →  gap = 70px  →  character fits at newY 956..1016 ✓
//
//   Corridor BELOW admin (above nursing):
//     admin bottom = 1040+620 = 1660
//     nursing top = 1730  →  gap = 70px  →  character fits at newY 1646..1706 ✓
//
//   Both horizontal left/right paths are now mathematically confirmed OPEN.
export const REGIONS = [
  { id: 'admin_block_1',      x: 432, y: 1040, w: 52,  h: 620, solid: true },  // bottom at y:1660
  { id: 'academic_1_2',       x: 278, y: 1040, w: 140, h: 380, solid: true },  // bottom at y:1420
  { id: 'nursing_3',          x: 450, y: 1730, w: 380, h: 120, solid: true },  // top at y:1730 → 70px gap above nursing
  { id: 'pharmacy_nexus_4',   x: 260, y: 845,  w: 660, h: 125, solid: true },  // bottom at y:970 → 70px gap below pharmacy
  { id: 'academic_4_5',       x: 1022, y: 978, w: 140, h: 98,  solid: true },
  { id: 'academic_2_6',       x: 1192, y: 332, w: 228, h: 460, solid: true },
  { id: 'academic_3_7',       x: 628,  y: 358, w: 206, h: 252, solid: true },
  { id: 'workshop_8',         x: 1212, y: 958, w: 272, h: 60,  solid: true },
  { id: 'auto_lab_9',         x: 1470, y: 412, w: 55,  h: 178, solid: true },
  { id: 'boys_hostel_10',     x: 1598, y: 676, w: 268, h: 360, solid: true },
  { id: 'girls_hostel_11',    x: 282,  y: 342, w: 342, h: 306, solid: true },
  { id: 'meditation_12',      x: 1010, y: 904, w: 148, h: 18,  solid: true },
  { id: 'priest_quarters_13', x: 708,  y: 696, w: 182, h: 46,  solid: true },
  { id: 'temple_14',          x: 906,  y: 1020, w: 48, h: 430, solid: true },
  { id: 'atm_15',             x: 970,  y: 1780, w: 30, h: 30,  solid: true },
  { id: 'post_office_17',     x: 348,  y: 1820, w: 55, h: 75,  solid: true },
  { id: 'generator_room_18',  x: 274,  y: 1740, w: 62, h: 72,  solid: true },
  { id: 'stp_20',             x: 970,  y: 46,   w: 65, h: 110, solid: true },
];

export const SPAWN_X = 855;
export const SPAWN_Y = 1960;

export const NEXUS_DOOR_BOX = {
  x: 241,
  y: 815,
  w: 697,
  h: 169
};

export const SIGN_BOX = {
  x: 530,
  y: 710,
  w: 40,
  h: 40
};
