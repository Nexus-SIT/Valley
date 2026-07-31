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

const renderHotspotReplacement = `  // Render invisible hotspot over the image's existing pins
  const renderBuildingHotspot = (b, isInteractive) => {
    const isSelected = selectedBuilding?.id === b.id;
    const isHovered = hoveredBuilding?.id === b.id;
    const textX = b.pinX || (b.shape === 'oval' ? b.cx : b.x + (b.w ? b.w / 2 : 0));
    const textY = b.pinY || (b.shape === 'oval' ? b.cy : b.y + (b.h ? b.h / 2 : 0));

    return (
      <g 
        key={\`hotspot-\${b.id}\`} 
        style={isInteractive ? { cursor: 'pointer' } : { pointerEvents: 'none' }}
        onClick={isInteractive ? () => handleSelectBuilding(b) : undefined}
        onMouseEnter={isInteractive ? () => setHoveredBuilding(b) : undefined}
        onMouseLeave={isInteractive ? () => setHoveredBuilding(null) : undefined}
      >
        <circle 
          cx={textX} 
          cy={textY - 5} 
          r={24} 
          fill="transparent" 
        />
        {isInteractive && (
          <circle 
            cx={textX} 
            cy={textY + 12} 
            r={isSelected || isHovered ? 6 : 4} 
            fill={isSelected ? '#ff3366' : isHovered ? '#60efff' : 'rgba(255, 255, 255, 0.6)'} 
            stroke={isSelected || isHovered ? '#fff' : 'rgba(0,0,0,0.3)'}
            strokeWidth={isSelected || isHovered ? 2 : 1}
            style={{ transition: 'all 0.2s ease' }}
          />
        )}
      </g>
    );
  };`;
  
content = content.replace(/\/\/ Render pixel-accurate GIS style building outlines[\s\S]*?className="map-building-hotspot"\s*\/>\s*\);\s*\}/, renderHotspotReplacement);


const renderNumberReplacement = `  // Numbers are already baked into the background image, return null
  const renderBuildingNumber = (b, isInteractive) => {
    return null;
  };`;

content = content.replace(/\/\/ Render building number badges at their exact centers[\s\S]*?<\/g>\s*\);\s*\}/, renderNumberReplacement);


content = content.replace(/<h2 style=\{styles\.modalTitle\}>Srinivas Institute of Technology<\/h2>/, '<h2 style={styles.modalTitle}>Srinivas Institute of Technology - NEW PIN MAP</h2>');

const pinpointReplacement = `(() => {
                      let pinX = selectedBuilding.pinX || (selectedBuilding.shape === 'oval' ? selectedBuilding.cx : selectedBuilding.x + (selectedBuilding.w ? selectedBuilding.w / 2 : 0));
                      let pinY = selectedBuilding.pinY || (selectedBuilding.shape === 'oval' ? selectedBuilding.cy : selectedBuilding.y + (selectedBuilding.h ? selectedBuilding.h / 2 : 0));
                      return (`;

content = content.replace(/\(\(\) => \{\s*let pinX = selectedBuilding\.shape === 'oval' \? selectedBuilding\.cx : selectedBuilding\.x \+ \(selectedBuilding\.w \? selectedBuilding\.w \/ 2 : 0\);\s*let pinY = selectedBuilding\.shape === 'oval' \? selectedBuilding\.cy : selectedBuilding\.y \+ \(selectedBuilding\.h \? selectedBuilding\.h \/ 2 : 0\);\s*if \(selectedBuilding\.id === 10\) \{ pinX = 1740; pinY = 720; \}\s*return \(/, pinpointReplacement);


const waypointReplacement = `(() => {
            const wpX = waypointBuilding.pinX || (waypointBuilding.shape === 'oval' ? waypointBuilding.cx : waypointBuilding.x + (waypointBuilding.w ? waypointBuilding.w / 2 : 0));
            const wpY = waypointBuilding.pinY || (waypointBuilding.shape === 'oval' ? waypointBuilding.cy : waypointBuilding.y + (waypointBuilding.h ? waypointBuilding.h / 2 : 0));
            return (`;

content = content.replace(/\(\(\) => \{\s*const wpX = waypointBuilding\.shape === 'oval' \? waypointBuilding\.cx : waypointBuilding\.x \+ \(waypointBuilding\.w \? waypointBuilding\.w \/ 2 : 0\);\s*const wpY = waypointBuilding\.shape === 'oval' \? waypointBuilding\.cy : waypointBuilding\.y \+ \(waypointBuilding\.h \? waypointBuilding\.h \/ 2 : 0\);\s*return \(/, waypointReplacement);

fs.writeFileSync(file, content);
console.log("SUCCESS");
