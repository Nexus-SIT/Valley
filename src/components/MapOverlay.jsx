import { useState, useMemo, useRef } from 'react';
import MiniMap from './MiniMap';

const MAP_SIZE = 2000;

// Coordinate calibration: 1:1 direct mapping from game engine (0-2000) to visual campus_map.png
const mapCoordinates = (x, y) => {
  return { x: Math.round(x), y: Math.round(y) };
};

// List of all 21 buildings with pixel-accurate polygon & roof boundaries matching GIS annotation style
const BUILDINGS = [
  { 
    id: 1, 
    name: 'Administrative block', 
    category: 'admin', 
    desc: 'The central administrative office and reception headquarters.', 
    shape: 'polygon', 
    points: '416,1014 498,1014 498,1718 416,1718',
    x: 416, y: 1014, w: 82, h: 704, 
    pinX: 457, pinY: 1260, gameX: 350, gameY: 950 
  },
  { 
    id: 2, 
    name: 'Academic block I', 
    category: 'academic', 
    desc: 'Main academic building housing large lecture halls and faculty chambers.', 
    shape: 'polygon', 
    points: '262,1014 435,1014 435,1145 345,1145 345,1477 262,1477',
    x: 262, y: 1014, w: 173, h: 463,
    pinX: 275, pinY: 1120, gameX: 100, gameY: 1000 
  },
  { 
    id: 3, 
    name: 'Srinivas institute of nursing sciences', 
    category: 'academic', 
    desc: 'State-of-the-art training labs and classrooms for nursing education.', 
    shape: 'polygon',
    points: '429,1678 849,1678 849,1875 429,1875',
    x: 429, y: 1678, w: 420, h: 197, 
    pinX: 639, pinY: 1630, gameX: 650, gameY: 1620 
  },
  { 
    id: 4, 
    name: 'Srinivas college of pharmacy (NEXUS)', 
    category: 'academic', 
    desc: 'Interactive classrooms and research labs for pharmaceutical sciences. This building houses the NEXUS Headquarters. Walk to the entrance and press SPACE or E in the game to access the central terminal.', 
    shape: 'polygon',
    points: '241,815 938,815 938,984 241,984',
    x: 241, y: 815, w: 697, h: 169, 
    pinX: 300, pinY: 900, gameX: 550, gameY: 700, 
    isNexus: true 
  },
  { 
    id: 5, 
    name: 'Academic block IV', 
    category: 'academic', 
    desc: 'Advanced lecture halls and specialized research departments.', 
    shape: 'polygon',
    points: '1013,967 1172,967 1172,1086 1013,1086',
    x: 1013, y: 967, w: 159, h: 119, 
    pinX: 1092, pinY: 1026, gameX: 950, gameY: 750 
  },
  { 
    id: 6, 
    name: 'Academic block II', 
    category: 'academic', 
    desc: 'Computing facilities, main server room, and software labs.', 
    shape: 'polygon',
    points: '1180,317 1434,317 1434,802 1180,802',
    x: 1180, y: 317, w: 254, h: 485, 
    pinX: 1307, pinY: 430, gameX: 1100, gameY: 400 
  },
  { 
    id: 7, 
    name: 'Academic block III', 
    category: 'academic', 
    desc: 'Large lecture halls, seminar rooms, and open courtyard.', 
    shape: 'polygon',
    points: '617,345 850,345 850,624 617,624',
    x: 617, y: 345, w: 233, h: 279, 
    pinX: 733, pinY: 484, gameX: 560, gameY: 300 
  },
  { 
    id: 8, 
    name: 'Mechanical work shop', 
    category: 'academic', 
    desc: 'Heavy machinery, casting, and machining workshops.', 
    shape: 'polygon',
    points: '1201,948 1501,948 1501,1033 1201,1033',
    x: 1201, y: 948, w: 300, h: 85, 
    pinX: 1351, pinY: 990, gameX: 1350, gameY: 670 
  },
  { 
    id: 9, 
    name: 'Automobile lab', 
    category: 'academic', 
    desc: 'Hands-on practical workshop featuring engine assemblies and chassis testing.', 
    shape: 'polygon',
    points: '1462,398 1540,398 1540,607 1462,607',
    x: 1462, y: 398, w: 78, h: 209, 
    pinX: 1501, pinY: 502, gameX: 1420, gameY: 300 
  },
  { 
    id: 10, 
    name: 'Boys hostel', 
    category: 'hostel', 
    desc: 'Residential halls, dining mess, and lounges for male students.', 
    shape: 'polygon', 
    points: '1680,664 1882,800 1740,1052 1586,916',
    x: 1586, y: 664, w: 296, h: 388,
    pinX: 1734, pinY: 858, gameX: 1500, gameY: 700 
  },
  { 
    id: 11, 
    name: 'Girls hostel', 
    category: 'hostel', 
    desc: 'Secure residential block with modern amenities and gardens for female students.', 
    shape: 'polygon',
    points: '268,328 643,328 643,662 268,662',
    x: 268, y: 328, w: 375, h: 334, 
    pinX: 455, pinY: 495, gameX: 540, gameY: 300 
  },
  { 
    id: 12, 
    name: 'Meditation center', 
    category: 'spiritual', 
    desc: 'A quiet, peaceful pavilion designated for yoga and mindfulness.', 
    shape: 'polygon',
    points: '1006,902 1166,902 1166,927 1006,927',
    x: 1006, y: 902, w: 160, h: 25, 
    pinX: 1086, pinY: 850, gameX: 950, gameY: 620 
  },
  { 
    id: 13, 
    name: 'Priest quarters', 
    category: 'spiritual', 
    desc: 'Living quarters for the temple priests and maintenance staff.', 
    shape: 'polygon',
    points: '702,692 904,692 904,749 702,749',
    x: 702, y: 692, w: 202, h: 57, 
    pinX: 803, pinY: 720, gameX: 600, gameY: 500 
  },
  { 
    id: 14, 
    name: 'Srinivasa temple', 
    category: 'spiritual', 
    desc: 'Traditional temple offering a spiritual haven and cultural center on campus.', 
    shape: 'polygon',
    points: '899,1005 970,1005 970,1460 899,1460',
    x: 899, y: 1005, w: 71, h: 455, 
    pinX: 934, pinY: 1050, gameX: 880, gameY: 1000 
  },
  { 
    id: 15, 
    name: 'ATM', 
    category: 'amenities', 
    desc: '24/7 banking kiosk for cash withdrawals and basic banking services.', 
    shape: 'polygon',
    points: '946,1754 1013,1754 1013,1896 946,1896',
    x: 946, y: 1754, w: 67, h: 142, 
    pinX: 979, pinY: 1720, gameX: 970, gameY: 1700 
  },
  { 
    id: 16, 
    name: 'College ground', 
    category: 'sports', 
    desc: 'Large athletic turf with a standard running track and football field.', 
    cx: 1460, cy: 1540, rx: 390, ry: 240, 
    shape: 'oval', 
    pinX: 1460, pinY: 1370, gameX: 1200, gameY: 1400 
  },
  { 
    id: 17, 
    name: 'Post office', 
    category: 'amenities', 
    desc: 'Local post branch for campus mailing, packages, and logistics.', 
    shape: 'polygon',
    points: '335,1810 416,1810 416,1915 335,1915',
    x: 335, y: 1810, w: 81, h: 105, 
    pinX: 375, pinY: 1840, gameX: 320, gameY: 1780 
  },
  { 
    id: 18, 
    name: 'Generator room', 
    category: 'amenities', 
    desc: 'High-capacity generator facility supplying uninterrupted backup power.', 
    shape: 'polygon',
    points: '262,1725 349,1725 349,1839 262,1839',
    x: 262, y: 1725, w: 87, h: 114, 
    pinX: 305, pinY: 1782, gameX: 230, gameY: 1700 
  },
  { 
    id: 19, 
    name: 'Parking area', 
    category: 'amenities', 
    desc: 'Spacious vehicle parking slots for students, staff, and visitors.', 
    shape: 'polygon',
    points: '180,1510 270,1510 270,1640 180,1640',
    x: 180, y: 1510, w: 90, h: 130, 
    pinX: 225, pinY: 1480, gameX: 150, gameY: 1500 
  },
  { 
    id: 20, 
    name: 'Sewage treatment plant', 
    category: 'amenities', 
    desc: 'Eco-friendly water processing unit ensuring sustainable campus waste management.', 
    shape: 'polygon',
    points: '966,38 1046,38 1046,171 966,171',
    x: 966, y: 38, w: 80, h: 133, 
    pinX: 1006, pinY: 150, gameX: 920, gameY: 100 
  },
  { 
    id: 21, 
    name: 'Garden', 
    category: 'amenities', 
    desc: 'A beautifully landscaped garden area providing a serene green environment at the heart of the campus, ideal for relaxation and outdoor study.', 
    shape: 'polygon',
    points: '570,1020 880,1020 880,1590 570,1590',
    x: 570, y: 1020, w: 310, h: 570, 
    pinX: 725, pinY: 1160, gameX: 720, gameY: 1100 
  }
];

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'academic', label: 'Academic' },
  { id: 'hostel', label: 'Hostels' },
  { id: 'spiritual', label: 'Spiritual' },
  { id: 'amenities', label: 'Amenities' },
  { id: 'sports_admin', label: 'Admin & Sports' }
];

const MapOverlay = ({ gameState, onTeleport }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [hoveredBuilding, setHoveredBuilding] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [showFullLegend, setShowFullLegend] = useState(false);
  const [activeTab, setActiveTab] = useState('inspect'); // 'inspect' or 'directory'
  const [teleportToast, setTeleportToast] = useState(null);
  const [waypointBuilding, setWaypointBuilding] = useState(null);

  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const mapViewportRef = useRef(null);

  // Calibrate player coordinates to align with campus_map.png
  const calibratedPos = useMemo(() => {
    if (!gameState) return { x: 0, y: 0 };
    return mapCoordinates(gameState.playerX, gameState.playerY);
  }, [gameState]);

  // Filter buildings based on search query and active category chip
  const filteredBuildings = useMemo(() => {
    return BUILDINGS.filter(b => {
      const matchesSearch = !searchQuery || 
        b.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        b.id.toString() === searchQuery.trim();
      const matchesCategory = activeCategory === 'all' || 
        (activeCategory === 'sports_admin' ? (b.category === 'sports' || b.category === 'admin') : b.category === activeCategory);
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory]);

  const focusBuildingOnMap = () => {};

  const handleSelectBuilding = (b) => {
    setSelectedBuilding(b);
    setActiveTab('inspect');
    focusBuildingOnMap(b);
  };

  const handleMouseMove = (e) => {
    if (mapViewportRef.current) {
      const rect = mapViewportRef.current.getBoundingClientRect();
      setTooltipPos({
        x: e.clientX - rect.left + 15,
        y: e.clientY - rect.top - 10
      });
    }
  };

  // Fast Travel Teleport
  const triggerTeleport = (b) => {
    if (!b || typeof onTeleport !== 'function') return;
    onTeleport(b.gameX, b.gameY);
    setTeleportToast(`⚡ Teleported to ${b.name}!`);
    setTimeout(() => setTeleportToast(null), 3000);
  };

  // Render invisible hotspot over the image's existing pins
  const renderBuildingHotspot = (b, isInteractive) => {
    const isSelected = selectedBuilding?.id === b.id;
    const isHovered = hoveredBuilding?.id === b.id;
    const textX = b.pinX || (b.shape === 'oval' ? b.cx : b.x + (b.w ? b.w / 2 : 0));
    const textY = b.pinY || (b.shape === 'oval' ? b.cy : b.y + (b.h ? b.h / 2 : 0));

    return (
      <g 
        key={`hotspot-${b.id}`} 
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
        {isInteractive && (isSelected || isHovered) && (
          <circle 
            cx={textX} 
            cy={textY - 5} 
            r={isSelected ? 8 : 6} 
            fill="none"
            stroke={isSelected ? '#ff3366' : '#60efff'}
            strokeWidth={isSelected ? 3 : 2}
            opacity={0.95}
            style={{ transition: 'all 0.2s ease' }}
          />
        )}
      </g>
    );
  };

  // Numbers are already baked into the background image, return null
  const renderBuildingNumber = () => {
    return null;
  };

  return (
    <>
      {/* --- HUD MINI-MAP (Top Right) --- */}
      <MiniMap gameState={gameState} onClick={() => setIsOpen(true)} />

      {/* --- FULL MAP MODAL --- */}
      {isOpen && (
        <div style={styles.modalOverlay} onClick={() => setIsOpen(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            
            {/* Modal Header */}
            <div style={styles.modalHeader}>
              <div style={styles.modalTitleArea}>
                <h2 style={styles.modalTitle}>Srinivas Institute of Technology - NEW PIN MAP</h2>
                <p style={styles.modalSubtitle}>Valachil Campus Map & Interactive GIS Building Directory</p>
              </div>
              <div style={styles.headerButtons}>
                <button 
                  style={styles.infoButton} 
                  className="modal-action-btn"
                  onClick={() => setShowFullLegend(true)}
                  title="Display full building reference"
                >
                  📋 Directory Table
                </button>
                <button 
                  style={styles.closeButton}
                  className="modal-close-btn"
                  onClick={() => setIsOpen(false)}
                >
                  &times;
                </button>
              </div>
            </div>

            {/* Toast Notice */}
            {teleportToast && (
              <div style={styles.toastNotice}>
                {teleportToast}
              </div>
            )}

            {/* Modal Main Body */}
            <div style={styles.modalBody}>
              {/* Map (Left) - Interactive Viewport */}
              <div 
                ref={mapViewportRef}
                style={styles.mapContainer}
                onMouseMove={handleMouseMove}
              >


                {/* Map Content Box */}
                <div style={styles.mapInner}>
                  <img
                    src="/campus_map.png"
                    alt="SIT Valachil Campus Map"
                    style={styles.mapImage}
                    draggable={false}
                  />
                  <svg
                    viewBox={`0 0 ${MAP_SIZE} ${MAP_SIZE}`}
                    preserveAspectRatio="none"
                    style={styles.mapSvgOverlay}
                  >
                    {BUILDINGS.map(b => renderBuildingHotspot(b, true))}
                    {BUILDINGS.map(b => renderBuildingNumber(b, true))}

                    {calibratedPos && (
                      <g key="player-marker-full">
                        <circle cx={calibratedPos.x} cy={calibratedPos.y} r={28} fill="#ffeb3b" opacity={0.35}>
                          <animate attributeName="r" values="18;34;18" dur="2s" repeatCount="indefinite" />
                          <animate attributeName="opacity" values="0.5;0.1;0.5" dur="2s" repeatCount="indefinite" />
                        </circle>
                        <circle cx={calibratedPos.x} cy={calibratedPos.y} r={10} fill="#f44336" stroke="#fff" strokeWidth={2.5} />
                        <polygon points={`${calibratedPos.x},${calibratedPos.y-18} ${calibratedPos.x-6},${calibratedPos.y-10} ${calibratedPos.x+6},${calibratedPos.y-10}`} fill="#f44336" stroke="#fff" strokeWidth={1} />
                        <text x={calibratedPos.x} y={calibratedPos.y + 3} fill="#fff" fontSize="8" fontWeight="900" textAnchor="middle" fontFamily="'Inter', sans-serif">YOU</text>
                      </g>
                    )}
                  </svg>
                </div>

                {/* Floating Hover Tooltip */}
                {hoveredBuilding && (
                  <div 
                    style={{
                      ...styles.floatingTooltip,
                      left: tooltipPos.x,
                      top: tooltipPos.y
                    }}
                  >
                    <span style={styles.tooltipBadge}>{hoveredBuilding.id}</span>
                    <span style={styles.tooltipName}>{hoveredBuilding.name}</span>
                  </div>
                )}
              </div>

              {/* Sidebar directory (Right) */}
              <div style={styles.sidebar}>
                {/* Search box */}
                <div style={styles.searchBox}>
                  <input 
                    type="text" 
                    placeholder="Search buildings (name or #)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={styles.searchInput}
                  />
                  {searchQuery && (
                    <button style={styles.clearSearchBtn} onClick={() => setSearchQuery('')}>&times;</button>
                  )}
                </div>

                {/* Category Chips */}
                <div style={styles.categoryChipsContainer}>
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat.id}
                      style={{
                        ...styles.categoryChip,
                        backgroundColor: activeCategory === cat.id ? '#60efff' : 'rgba(255,255,255,0.06)',
                        color: activeCategory === cat.id ? '#0a0e17' : 'rgba(255,255,255,0.7)',
                        fontWeight: activeCategory === cat.id ? 'bold' : 'normal'
                      }}
                      onClick={() => setActiveCategory(cat.id)}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* Tabs */}
                <div style={styles.tabContainer}>
                  <button 
                    style={activeTab === 'inspect' ? styles.activeTabBtn : styles.tabBtn} 
                    onClick={() => setActiveTab('inspect')}
                  >
                    Inspect Building
                  </button>
                  <button 
                    style={activeTab === 'directory' ? styles.activeTabBtn : styles.tabBtn} 
                    onClick={() => setActiveTab('directory')}
                  >
                    Directory ({filteredBuildings.length})
                  </button>
                </div>

                {/* Tab Content */}
                <div style={styles.sidebarContent}>
                  {activeTab === 'inspect' ? (
                    <div style={styles.inspectPanel}>
                      {selectedBuilding ? (
                        <div style={styles.buildingDetailCard}>
                          <div style={styles.cardHeader}>
                            <span style={styles.buildingBadge}>#{selectedBuilding.id}</span>
                            <div>
                              <h3 style={styles.buildingDetailName}>{selectedBuilding.name}</h3>
                              <span style={styles.categoryTag}>{selectedBuilding.category.toUpperCase()}</span>
                            </div>
                          </div>

                          <div style={styles.cardDivider} />

                          <p style={styles.buildingDetailDesc}>{selectedBuilding.desc}</p>

                          <div style={styles.buildingCoordinates}>
                            <span>📍 Map Grid: X={selectedBuilding.x || selectedBuilding.cx}, Y={selectedBuilding.y || selectedBuilding.cy}</span>
                          </div>

                          {/* Interactive Action Buttons */}
                          <div style={styles.cardActions}>
                            <button
                              style={styles.teleportBtn}
                              className="teleport-action-btn"
                              onClick={() => triggerTeleport(selectedBuilding)}
                            >
                              ⚡ Fast Travel Teleport
                            </button>

                            <div style={styles.secondaryActions}>
                              <button
                                style={styles.waypointBtn}
                                className="secondary-action-btn"
                                onClick={() => {
                                  setWaypointBuilding(waypointBuilding?.id === selectedBuilding.id ? null : selectedBuilding);
                                }}
                              >
                                {waypointBuilding?.id === selectedBuilding.id ? '📍 Remove Waypoint' : '🎯 Set Waypoint'}
                              </button>

                              <button
                                style={styles.focusBtn}
                                className="secondary-action-btn"
                                onClick={() => focusBuildingOnMap(selectedBuilding)}
                              >
                                🔍 Focus View
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div style={styles.emptyInspectState}>
                          <div style={styles.emptyInspectIcon}>🏛️</div>
                          <p style={{ margin: '8px 0 0 0', fontWeight: 'bold', color: '#fff' }}>Building Inspection Mode</p>
                          <p style={{ margin: '4px 0 16px 0' }}>Click any building on the map image or select from the directory list to inspect full details & fast travel.</p>
                          <div style={styles.startingLocationNotice}>
                            <span>💡 Current Spawn: <strong>#1 Administrative block</strong></span>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={styles.directoryList}>
                      {filteredBuildings.map(b => (
                        <div 
                          key={b.id} 
                          className="directory-item-row"
                          style={{
                            ...styles.directoryItem,
                            backgroundColor: selectedBuilding?.id === b.id ? 'rgba(96, 239, 255, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                            borderLeftColor: selectedBuilding?.id === b.id ? '#60efff' : 'transparent'
                          }}
                          onClick={() => handleSelectBuilding(b)}
                          onMouseEnter={() => setHoveredBuilding(b)}
                          onMouseLeave={() => setHoveredBuilding(null)}
                        >
                          <span style={styles.directoryBadge}>{b.id}</span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={styles.directoryName}>{b.name}</div>
                            <div style={styles.directorySubtext}>{b.category}</div>
                          </div>
                          {b.isNexus && <span style={styles.nexusPill}>NEXUS HQ</span>}
                        </div>
                      ))}
                      {filteredBuildings.length === 0 && (
                        <p style={styles.noResultsText}>No buildings matching your search/category filter.</p>
                      )}
                    </div>
                  )}
                </div>

              </div>
            </div>

          </div>
        </div>
      )}

      {/* --- CAMPUS INFO / LEGEND FULL POPUP --- */}
      {showFullLegend && (
        <div style={styles.legendOverlay} onClick={() => setShowFullLegend(false)}>
          <div style={styles.legendContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.legendHeader}>
              <h3 style={styles.legendTitle}>Campus Directory Reference</h3>
              <button 
                style={styles.closeLegendBtn} 
                className="modal-close-btn"
                onClick={() => setShowFullLegend(false)}
              >
                &times;
              </button>
            </div>
            <div style={styles.legendBody}>
              <table style={styles.legendTable}>
                <thead>
                  <tr>
                    <th style={styles.thBadge}>#</th>
                    <th style={styles.thName}>Building / Facility Name</th>
                    <th style={styles.thCategory}>Category</th>
                  </tr>
                </thead>
                <tbody>
                  {BUILDINGS.map(b => (
                    <tr 
                      key={b.id} 
                      className="legend-table-row"
                      style={styles.legendRow}
                      onClick={() => {
                        handleSelectBuilding(b);
                        setShowFullLegend(false);
                      }}
                      onMouseEnter={() => setHoveredBuilding(b)}
                      onMouseLeave={() => setHoveredBuilding(null)}
                    >
                      <td style={styles.tdBadge}>
                        <span style={styles.tableBadge}>{b.id}</span>
                      </td>
                      <td style={styles.tdName}>
                        <div style={styles.tableName}>{b.name}</div>
                        <div style={styles.tableDesc}>{b.desc}</div>
                      </td>
                      <td style={styles.tdCategory}>
                        <span style={styles.tableCategoryPill}>{b.category}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const styles = {
  // Mini Map HUD Styles
  miniMapWrapper: {
    position: 'fixed',
    top: '20px',
    right: '20px',
    width: '160px',
    height: '160px',
    borderRadius: '16px',
    overflow: 'hidden',
    border: '3px solid rgba(255, 255, 255, 0.15)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 0 10px rgba(0,0,0,0.5)',
    cursor: 'pointer',
    zIndex: 99,
    background: '#1a1f2b',
    userSelect: 'none'
  },
  miniMapSvg: {
    width: '100%',
    height: '100%',
    display: 'block'
  },
  miniMapOverlay: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '8px',
    pointerEvents: 'none',
    background: 'linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.4) 100%)'
  },
  miniMapLabel: {
    color: '#fff',
    fontSize: '9px',
    fontWeight: 'bold',
    letterSpacing: '1.5px',
    textShadow: '0 1px 2px rgba(0,0,0,0.8)',
    fontFamily: "'Outfit', sans-serif"
  },
  miniMapExpandHint: {
    color: '#60efff',
    fontSize: '8px',
    fontWeight: 'bold',
    alignSelf: 'flex-end',
    textShadow: '0 1px 2px rgba(0,0,0,0.8)',
    fontFamily: "'Inter', sans-serif",
    letterSpacing: '0.5px'
  },

  // Modal Styles
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100
  },
  modalContent: {
    background: 'rgba(23, 28, 41, 0.96)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderRadius: '24px',
    boxShadow: '0 24px 64px rgba(0, 0, 0, 0.75)',
    width: '94vw',
    height: '90vh',
    maxWidth: '1100px',
    maxHeight: '800px',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    fontFamily: "'Inter', sans-serif",
    position: 'relative'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 24px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    background: 'rgba(15, 20, 31, 0.6)'
  },
  modalTitleArea: {
    display: 'flex',
    flexDirection: 'column'
  },
  modalTitle: {
    margin: 0,
    fontSize: '1.5rem',
    fontWeight: 700,
    fontFamily: "'Outfit', sans-serif",
    background: 'linear-gradient(90deg, #60efff, #0061ff)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
  },
  modalSubtitle: {
    margin: '2px 0 0 0',
    fontSize: '0.82rem',
    color: 'rgba(255, 255, 255, 0.5)'
  },
  headerButtons: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  infoButton: {
    background: 'rgba(96, 239, 255, 0.12)',
    color: '#60efff',
    border: '1px solid rgba(96, 239, 255, 0.3)',
    borderRadius: '8px',
    padding: '8px 14px',
    fontSize: '0.85rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontFamily: "'Inter', sans-serif"
  },
  closeButton: {
    background: 'none',
    border: 'none',
    color: 'rgba(255,255,255,0.6)',
    fontSize: '28px',
    cursor: 'pointer',
    padding: '0 4px',
    lineHeight: 1
  },
  toastNotice: {
    position: 'absolute',
    top: '70px',
    left: '50%',
    transform: 'translateX(-50%)',
    background: 'linear-gradient(90deg, #0061ff, #60efff)',
    color: '#000',
    fontWeight: 'bold',
    padding: '8px 20px',
    borderRadius: '20px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
    zIndex: 150,
    fontSize: '0.88rem'
  },
  modalBody: {
    flex: 1,
    display: 'flex',
    overflow: 'hidden',
    position: 'relative'
  },
  mapContainer: {
    flex: '1.4',
    background: '#121620',
    overflow: 'hidden',
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'stretch',
    userSelect: 'none'
  },
  mapInner: {
    position: 'relative',
    width: '100%',
    height: '100%'
  },
  mapImage: {
    display: 'block',
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    pointerEvents: 'none'
  },
  mapSvgOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%'
  },
  zoomControls: {
    position: 'absolute',
    bottom: '16px',
    left: '16px',
    display: 'flex',
    gap: '6px',
    zIndex: 20
  },
  zoomBtn: {
    width: '34px',
    height: '34px',
    borderRadius: '8px',
    background: 'rgba(15, 20, 31, 0.85)',
    border: '1px solid rgba(255,255,255,0.15)',
    color: '#fff',
    fontSize: '18px',
    fontWeight: 'bold',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    backdropFilter: 'blur(4px)'
  },
  zoomResetBtn: {
    padding: '0 12px',
    height: '34px',
    borderRadius: '8px',
    background: 'rgba(15, 20, 31, 0.85)',
    border: '1px solid rgba(255,255,255,0.15)',
    color: '#60efff',
    fontSize: '0.78rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    backdropFilter: 'blur(4px)'
  },
  zoomFocusBtn: {
    padding: '0 12px',
    height: '34px',
    borderRadius: '8px',
    background: 'rgba(255, 51, 102, 0.2)',
    border: '1px solid rgba(255, 51, 102, 0.4)',
    color: '#ff3366',
    fontSize: '0.78rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    backdropFilter: 'blur(4px)'
  },
  floatingTooltip: {
    position: 'absolute',
    pointerEvents: 'none',
    zIndex: 30,
    background: 'rgba(10, 14, 23, 0.92)',
    border: '1px solid #60efff',
    borderRadius: '8px',
    padding: '6px 10px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
    backdropFilter: 'blur(6px)'
  },
  tooltipBadge: {
    background: '#60efff',
    color: '#0a0e17',
    fontSize: '0.75rem',
    fontWeight: 'bold',
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontFamily: "'Outfit', sans-serif"
  },
  tooltipName: {
    color: '#fff',
    fontSize: '0.82rem',
    fontWeight: 'bold',
    whiteSpace: 'nowrap'
  },
  sidebar: {
    flex: '0.9',
    borderLeft: '1px solid rgba(255, 255, 255, 0.08)',
    display: 'flex',
    flexDirection: 'column',
    background: 'rgba(10, 14, 23, 0.4)'
  },
  searchBox: {
    padding: '12px 16px',
    position: 'relative',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
  },
  searchInput: {
    width: '100%',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    padding: '9px 12px',
    color: '#fff',
    fontSize: '0.85rem',
    outline: 'none',
    fontFamily: "'Inter', sans-serif"
  },
  clearSearchBtn: {
    position: 'absolute',
    right: '24px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    color: 'rgba(255,255,255,0.4)',
    fontSize: '18px',
    cursor: 'pointer'
  },
  categoryChipsContainer: {
    display: 'flex',
    gap: '6px',
    padding: '8px 16px',
    overflowX: 'auto',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
  },
  categoryChip: {
    border: 'none',
    borderRadius: '12px',
    padding: '4px 10px',
    fontSize: '0.75rem',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'background 0.2s, color 0.2s'
  },
  tabContainer: {
    display: 'flex',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
  },
  tabBtn: {
    flex: 1,
    background: 'none',
    border: 'none',
    color: 'rgba(255,255,255,0.5)',
    padding: '10px',
    fontSize: '0.85rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    borderBottom: '2px solid transparent',
    fontFamily: "'Inter', sans-serif"
  },
  activeTabBtn: {
    flex: 1,
    background: 'none',
    border: 'none',
    color: '#60efff',
    padding: '10px',
    fontSize: '0.85rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    borderBottom: '2px solid #60efff',
    fontFamily: "'Inter', sans-serif"
  },
  sidebarContent: {
    flex: 1,
    overflowY: 'auto',
    padding: '16px'
  },

  // Inspect Panel Styles
  inspectPanel: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column'
  },
  buildingDetailCard: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '14px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  buildingBadge: {
    background: '#60efff',
    color: '#0a0e17',
    fontSize: '0.9rem',
    fontWeight: 'bold',
    padding: '4px 10px',
    borderRadius: '6px',
    fontFamily: "'Outfit', sans-serif"
  },
  buildingDetailName: {
    margin: 0,
    fontSize: '1.05rem',
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: "'Outfit', sans-serif"
  },
  categoryTag: {
    display: 'inline-block',
    fontSize: '0.65rem',
    fontWeight: 'bold',
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: '0.5px',
    marginTop: '2px'
  },
  cardDivider: {
    height: '1px',
    background: 'rgba(255,255,255,0.08)'
  },
  buildingDetailDesc: {
    margin: 0,
    fontSize: '0.88rem',
    lineHeight: 1.6,
    color: 'rgba(255, 255, 255, 0.8)'
  },
  buildingCoordinates: {
    fontSize: '0.78rem',
    color: '#60efff',
    opacity: 0.85
  },
  cardActions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginTop: '8px'
  },
  teleportBtn: {
    background: 'linear-gradient(90deg, #0061ff, #60efff)',
    color: '#000',
    border: 'none',
    borderRadius: '10px',
    padding: '10px 14px',
    fontSize: '0.88rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontFamily: "'Inter', sans-serif",
    boxShadow: '0 4px 12px rgba(0, 97, 255, 0.3)'
  },
  secondaryActions: {
    display: 'flex',
    gap: '8px'
  },
  waypointBtn: {
    flex: 1,
    background: 'rgba(255, 255, 255, 0.06)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    color: '#fff',
    borderRadius: '8px',
    padding: '8px 10px',
    fontSize: '0.78rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontFamily: "'Inter', sans-serif"
  },
  focusBtn: {
    flex: 1,
    background: 'rgba(255, 51, 102, 0.12)',
    border: '1px solid rgba(255, 51, 102, 0.3)',
    color: '#ff3366',
    borderRadius: '8px',
    padding: '8px 10px',
    fontSize: '0.78rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontFamily: "'Inter', sans-serif"
  },
  emptyInspectState: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center',
    padding: '0 20px',
    fontSize: '0.85rem',
    lineHeight: 1.5
  },
  emptyInspectIcon: {
    fontSize: '36px',
    marginBottom: '8px'
  },
  startingLocationNotice: {
    marginTop: '12px',
    padding: '8px 12px',
    background: 'rgba(96, 239, 255, 0.08)',
    border: '1px solid rgba(96, 239, 255, 0.2)',
    borderRadius: '8px',
    color: '#60efff',
    fontSize: '0.78rem'
  },

  // Directory Styles
  directoryList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  directoryItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '9px 12px',
    borderRadius: '8px',
    cursor: 'pointer',
    borderLeft: '3px solid transparent',
    transition: 'background 0.2s, border-left-color 0.2s'
  },
  directoryBadge: {
    minWidth: '22px',
    height: '22px',
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.1)',
    color: 'rgba(255,255,255,0.8)',
    fontSize: '0.75rem',
    fontWeight: 'bold',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontFamily: "'Outfit', sans-serif"
  },
  directoryName: {
    color: '#fff',
    fontSize: '0.85rem',
    fontWeight: '500',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  directorySubtext: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: '0.7rem',
    textTransform: 'uppercase'
  },
  nexusPill: {
    background: 'linear-gradient(90deg, #ff3366, #ff6b00)',
    color: '#fff',
    fontSize: '0.65rem',
    fontWeight: 'bold',
    padding: '2px 6px',
    borderRadius: '4px'
  },
  noResultsText: {
    textAlign: 'center',
    color: 'rgba(255,255,255,0.4)',
    fontSize: '0.85rem',
    marginTop: '20px'
  },

  // Legend Overlay Styles
  legendOverlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.78)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 110
  },
  legendContent: {
    background: 'rgba(18, 23, 35, 0.98)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderRadius: '20px',
    boxShadow: '0 20px 48px rgba(0, 0, 0, 0.7)',
    width: '90vw',
    height: '80vh',
    maxWidth: '650px',
    maxHeight: '650px',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    fontFamily: "'Inter', sans-serif",
    padding: '20px'
  },
  legendHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: '14px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
  },
  legendTitle: {
    margin: 0,
    fontSize: '1.25rem',
    fontWeight: 700,
    fontFamily: "'Outfit', sans-serif",
    color: '#60efff'
  },
  closeLegendBtn: {
    background: 'none',
    border: 'none',
    color: 'rgba(255,255,255,0.5)',
    fontSize: '24px',
    cursor: 'pointer',
    lineHeight: 1
  },
  legendBody: {
    flex: 1,
    overflowY: 'auto',
    marginTop: '12px'
  },
  legendTable: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left'
  },
  legendRow: {
    borderBottom: '1px solid rgba(255,255,255,0.04)',
    cursor: 'pointer',
    transition: 'background 0.2s'
  },
  thBadge: {
    padding: '10px 8px',
    fontSize: '0.78rem',
    color: 'rgba(255,255,255,0.4)',
    textTransform: 'uppercase',
    fontWeight: 'bold',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
  },
  thName: {
    padding: '10px 8px',
    fontSize: '0.78rem',
    color: 'rgba(255,255,255,0.4)',
    textTransform: 'uppercase',
    fontWeight: 'bold',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
  },
  thCategory: {
    padding: '10px 8px',
    fontSize: '0.78rem',
    color: 'rgba(255,255,255,0.4)',
    textTransform: 'uppercase',
    fontWeight: 'bold',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
  },
  tdBadge: {
    padding: '10px 8px',
    verticalAlign: 'top'
  },
  tdName: {
    padding: '10px 8px',
    verticalAlign: 'top'
  },
  tdCategory: {
    padding: '10px 8px',
    verticalAlign: 'top'
  },
  tableBadge: {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    background: '#60efff',
    color: '#0a0e17',
    fontSize: '0.72rem',
    fontWeight: 'bold',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontFamily: "'Outfit', sans-serif"
  },
  tableName: {
    color: '#fff',
    fontSize: '0.88rem',
    fontWeight: 'bold',
    fontFamily: "'Outfit', sans-serif",
    marginBottom: '2px'
  },
  tableDesc: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: '0.78rem',
    lineHeight: 1.4
  },
  tableCategoryPill: {
    background: 'rgba(255,255,255,0.08)',
    color: 'rgba(255,255,255,0.6)',
    fontSize: '0.68rem',
    padding: '2px 8px',
    borderRadius: '4px',
    textTransform: 'uppercase'
  }
};

// CSS styles injection for smooth transitions, hover effects, and keyframes
if (typeof document !== 'undefined') {
  const styleTag = document.createElement('style');
  styleTag.innerHTML = `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-6px); }
    }
    @keyframes pulse {
      0% { r: 8px; opacity: 0.8; }
      100% { r: 28px; opacity: 0; }
    }
    .hud-minimap-btn:hover {
      transform: scale(1.05);
      border-color: #60efff !important;
    }
    .map-building-hotspot:hover {
      fill: rgba(96, 239, 255, 0.28) !important;
      stroke: #60efff !important;
      stroke-width: 2.5px !important;
    }
    .pulsing-ring {
      animation: pulse 1.6s cubic-bezier(0.24, 0, 0.38, 1) infinite;
      transform-origin: center;
    }
    .bouncing-pin {
      animation: bounce 1.2s ease-in-out infinite;
    }
    .zoom-btn:hover {
      background: rgba(96, 239, 255, 0.25) !important;
      border-color: #60efff !important;
    }
    .modal-action-btn:hover {
      background: rgba(96, 239, 255, 0.25) !important;
    }
    .modal-close-btn:hover {
      color: #fff !important;
    }
    .teleport-action-btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 18px rgba(0, 97, 255, 0.5) !important;
    }
    .secondary-action-btn:hover {
      background: rgba(255, 255, 255, 0.15) !important;
    }
    .directory-item-row:hover {
      background: rgba(255, 255, 255, 0.08) !important;
    }
    .legend-table-row:hover {
      background: rgba(255, 255, 255, 0.04) !important;
    }
  `;
  document.head.appendChild(styleTag);
}

export default MapOverlay;
