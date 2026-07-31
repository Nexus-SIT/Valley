const fs = require('fs');
const file = 'c:/Valley/Valley/src/components/MapOverlay.jsx';
let content = fs.readFileSync(file, 'utf8');

// Update renderBuildingHotspot
const hotspotRegex = /<circle \s*cx=\{textX\} \s*cy=\{textY - 5\} \s*r=\{24\} \s*fill="transparent" \s*\/>/g;
const newHotspot = `<circle 
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
        )}`;
content = content.replace(hotspotRegex, newHotspot);

// Update selected-pin calculations (both occurrences)
const selectedPinRegex = /let pinX = selectedBuilding\.shape === 'oval' \? selectedBuilding\.cx : selectedBuilding\.x \+ \(selectedBuilding\.w \? selectedBuilding\.w \/ 2 : 0\);\s*let pinY = selectedBuilding\.shape === 'oval' \? selectedBuilding\.cy : selectedBuilding\.y \+ \(selectedBuilding\.h \? selectedBuilding\.h \/ 2 : 0\);\s*if \(selectedBuilding\.id === 10\) \{ pinX = 1740; pinY = 720; \}/g;

const newSelectedPin = `let pinX = selectedBuilding.pinX || (selectedBuilding.shape === 'oval' ? selectedBuilding.cx : selectedBuilding.x + (selectedBuilding.w ? selectedBuilding.w / 2 : 0));
                      let pinY = selectedBuilding.pinY || (selectedBuilding.shape === 'oval' ? selectedBuilding.cy : selectedBuilding.y + (selectedBuilding.h ? selectedBuilding.h / 2 : 0));`;

content = content.replace(selectedPinRegex, newSelectedPin);

// Update waypoint-pin calculation
const waypointRegex = /const wpX = waypointBuilding\.shape === 'oval' \? waypointBuilding\.cx : waypointBuilding\.x \+ \(waypointBuilding\.w \? waypointBuilding\.w \/ 2 : 0\);\s*const wpY = waypointBuilding\.shape === 'oval' \? waypointBuilding\.cy : waypointBuilding\.y \+ \(waypointBuilding\.h \? waypointBuilding\.h \/ 2 : 0\);/g;

const newWaypoint = `const wpX = waypointBuilding.pinX || (waypointBuilding.shape === 'oval' ? waypointBuilding.cx : waypointBuilding.x + (waypointBuilding.w ? waypointBuilding.w / 2 : 0));
            const wpY = waypointBuilding.pinY || (waypointBuilding.shape === 'oval' ? waypointBuilding.cy : waypointBuilding.y + (waypointBuilding.h ? waypointBuilding.h / 2 : 0));`;

content = content.replace(waypointRegex, newWaypoint);

fs.writeFileSync(file, content);
