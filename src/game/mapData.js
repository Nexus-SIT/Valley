export const MAP_WIDTH = 2000;
export const MAP_HEIGHT = 2000;

export const REGIONS = [
  // Background grass (Base layer)
  { type: 'grass', x: 0, y: 0, w: MAP_WIDTH, h: MAP_HEIGHT, color: '#518b38', solid: false },
  
  // --- DIRT & PAVED PATHS ---
  { type: 'path', x: 340, y: 0, w: 90, h: MAP_HEIGHT, color: '#c49a6c', solid: false }, // Left-center main north-south path
  { type: 'path', x: 520, y: 670, w: 450, h: 70, color: '#b5a18c', solid: false }, // Pharmacy entrance path
  { type: 'path', x: 0, y: 1640, w: MAP_WIDTH, h: 80, color: '#c49a6c', solid: false }, // Bottom main east-west path
  { type: 'path', x: 920, y: 0, w: 70, h: MAP_HEIGHT, color: '#b5a18c', solid: false }, // East central north-south walkway

  // --- CENTRAL GARDEN (#21) ---
  { type: 'garden', x: 560, y: 740, w: 330, h: 860, color: '#449e35', solid: false },

  // --- 21 BUILDINGS & FACILITIES (Solid Collision Boundaries matching image) ---
  { type: 'building', id: 'admin_block_1', x: 380, y: 720, w: 140, h: 980, color: '#4b6584', solid: true }, // #1 Administrative block
  { type: 'building', id: 'academic_1_2', x: 140, y: 720, w: 220, h: 750, color: '#3867d6', solid: true }, // #2 Academic block I
  { type: 'building', id: 'nursing_3', x: 430, y: 1680, w: 500, h: 200, color: '#20bf6b', solid: true }, // #3 Nursing sciences
  { type: 'building', id: 'pharmacy_nexus_4', x: 130, y: 530, w: 850, h: 140, color: '#eb3b5a', solid: true }, // #4 Pharmacy (NEXUS)
  { type: 'building', id: 'academic_4_5', x: 1000, y: 680, w: 180, h: 170, color: '#fa8231', solid: true }, // #5 Academic block IV
  { type: 'building', id: 'academic_2_6', x: 1160, y: 150, w: 270, h: 500, color: '#8854d0', solid: true }, // #6 Academic block II
  { type: 'building', id: 'academic_3_7', x: 630, y: 160, w: 290, h: 290, color: '#3867d6', solid: true }, // #7 Academic block III
  { type: 'building', id: 'workshop_8', x: 1200, y: 700, w: 320, h: 150, color: '#778ca3', solid: true }, // #8 Mechanical workshop
  { type: 'building', id: 'auto_lab_9', x: 1460, y: 200, w: 110, h: 230, color: '#4b6584', solid: true }, // #9 Automobile lab
  { type: 'building', id: 'boys_hostel_10', x: 1560, y: 500, w: 390, h: 430, color: '#26de81', solid: true }, // #10 Boys hostel
  { type: 'building', id: 'girls_hostel_11', x: 130, y: 140, w: 380, h: 370, color: '#fd9644', solid: true }, // #11 Girls hostel
  { type: 'building', id: 'meditation_12', x: 1000, y: 600, w: 150, h: 60, color: '#a55eea', solid: true }, // #12 Meditation center
  { type: 'building', id: 'priest_quarters_13', x: 630, y: 470, w: 290, h: 50, color: '#fed330', solid: true }, // #13 Priest quarters
  { type: 'building', id: 'temple_14', x: 900, y: 720, w: 70, h: 760, color: '#d6a058', solid: true }, // #14 Srinivasa temple
  { type: 'building', id: 'atm_15', x: 950, y: 1750, w: 80, h: 150, color: '#45cafc', solid: true }, // #15 ATM
  { type: 'building', id: 'college_ground_16', x: 1060, y: 1290, w: 800, h: 480, color: '#26de81', solid: false }, // #16 College ground field
  { type: 'building', id: 'post_office_17', x: 340, y: 1810, w: 90, h: 120, color: '#778ca3', solid: true }, // #17 Post office
  { type: 'building', id: 'generator_room_18', x: 250, y: 1720, w: 100, h: 120, color: '#4b6584', solid: true }, // #18 Generator room
  { type: 'building', id: 'parking_19', x: 180, y: 1510, w: 100, h: 130, color: '#68829e', solid: false }, // #19 Parking area
  { type: 'building', id: 'stp_20', x: 970, y: 30, w: 110, h: 120, color: '#45cafc', solid: true }, // #20 Sewage treatment plant

  // --- INTERACTIVE OBJECTS ---
  { type: 'sign', id: 'github_sign', x: 540, y: 720, w: 20, h: 20, color: '#8b5a2b', solid: true }
];

export const SPAWN_X = 550;
export const SPAWN_Y = 685;

export const NEXUS_DOOR_BOX = {
  x: 500,
  y: 670,
  w: 120,
  h: 50
};

export const SIGN_BOX = {
  x: 530,
  y: 710,
  w: 40,
  h: 40
};
