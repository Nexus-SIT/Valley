export const MAP_WIDTH = 2000;
export const MAP_HEIGHT = 2000;

// Precise building core collision boxes to keep all roads, alleys, and courtyards 100% open for smooth movement
export const REGIONS = [
  { id: 'admin_block_1', x: 436, y: 1050, w: 42, h: 630, solid: true },
  { id: 'academic_1_2', x: 300, y: 1050, w: 100, h: 390, solid: true },
  { id: 'nursing_3', x: 470, y: 1710, w: 340, h: 130, solid: true },
  { id: 'pharmacy_nexus_4', x: 300, y: 845, w: 580, h: 100, solid: true },
  { id: 'academic_4_5', x: 1035, y: 985, w: 110, h: 80, solid: true },
  { id: 'academic_2_6', x: 1220, y: 360, w: 170, h: 400, solid: true },
  { id: 'academic_3_7', x: 655, y: 385, w: 155, h: 190, solid: true },
  { id: 'workshop_8', x: 1240, y: 965, w: 220, h: 50, solid: true },
  { id: 'auto_lab_9', x: 1480, y: 430, w: 42, h: 145, solid: true },
  { id: 'boys_hostel_10', x: 1625, y: 705, w: 218, h: 306, solid: true },
  { id: 'girls_hostel_11', x: 310, y: 370, w: 290, h: 250, solid: true },
  { id: 'meditation_12', x: 1035, y: 910, w: 100, h: 15, solid: true },
  { id: 'priest_quarters_13', x: 740, y: 705, w: 120, h: 30, solid: true },
  { id: 'temple_14', x: 915, y: 1040, w: 40, h: 380, solid: true },
  { id: 'atm_15', x: 960, y: 1775, w: 38, h: 100, solid: true },
  { id: 'post_office_17', x: 350, y: 1830, w: 50, h: 65, solid: true },
  { id: 'generator_room_18', x: 280, y: 1745, w: 50, h: 74, solid: true },
  { id: 'stp_20', x: 980, y: 55, w: 50, h: 90, solid: true },
];

export const SPAWN_X = 550;
export const SPAWN_Y = 750;

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
