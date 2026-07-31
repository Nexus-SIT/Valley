const fs = require('fs');
const file = 'src/components/MapOverlay.jsx';
let content = fs.readFileSync(file, 'utf8');

const pins = {
  1: { pinX: 457, pinY: 1260 },
  2: { pinX: 275, pinY: 1120 },
  3: { pinX: 639, pinY: 1630 },
  4: { pinX: 560, pinY: 920 },
  5: { pinX: 1092, pinY: 1026 },
  6: { pinX: 1307, pinY: 430 },
  7: { pinX: 733, pinY: 484 },
  8: { pinX: 1351, pinY: 990 },
  9: { pinX: 1501, pinY: 502 },
  10: { pinX: 1734, pinY: 858 },
  11: { pinX: 455, pinY: 495 },
  12: { pinX: 1086, pinY: 850 },
  13: { pinX: 803, pinY: 720 },
  14: { pinX: 934, pinY: 1050 },
  15: { pinX: 979, pinY: 1720 },
  16: { pinX: 1460, pinY: 1370 },
  17: { pinX: 375, pinY: 1840 },
  18: { pinX: 305, pinY: 1782 },
  19: { pinX: 225, pinY: 1480 },
  20: { pinX: 1006, pinY: 150 },
  21: { pinX: 725, pinY: 1160 }
};

for (const [id, coords] of Object.entries(pins)) {
  const regex = new RegExp(`(id:\\s*${id},[\\s\\S]*?)(gameX:\\s*\\d+,\\s*gameY:\\s*\\d+\\s*})`);
  content = content.replace(regex, `$1pinX: ${coords.pinX}, pinY: ${coords.pinY}, $2`);
}
fs.writeFileSync(file, content);
console.log("SUCCESS");
