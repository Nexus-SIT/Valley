import React, { useState, useMemo } from 'react';

const MAP_SIZE = 2000;

// Coordinate calibration: maps character game coordinates (0-2000) to visual paths in campus_map.png
const mapCoordinates = (x, y) => {
  let rx = x;
  let ry = y;

  // X Coordinate Calibration
  if (x <= 300) {
    // Map left path: from game x=0..300 to image x=150..510
    rx = 150 + (x / 300) * 360;
  } else if (x > 300 && x <= 940) {
    // Map middle path: from game x=300..940 to image x=510..1010
    rx = 510 + ((x - 300) / 640) * 500;
  } else {
    // Map right path: from game x=940..2000 to image x=1010..1800
    rx = 1010 + ((x - 940) / 1060) * 790;
  }

  // Y Coordinate Calibration
  if (y <= 560) {
    // Map top path: from game y=0..560 to image y=150..700
    ry = 150 + (y / 560) * 550;
  } else if (y > 560 && y <= 950) {
    // Map middle path: from game y=560..950 to image y=700..1050
    ry = 700 + ((y - 560) / 390) * 350;
  } else {
    // Map bottom path: from game y=950..2000 to image y=1050..1800
    ry = 1050 + ((y - 950) / 1050) * 750;
  }

  return { x: Math.round(rx), y: Math.round(ry) };
};

// List of all 20 buildings with custom coordinates matching their locations in campus_map.png
const BUILDINGS = [
  { id: 1, name: 'Administrative block', desc: 'The central administrative office and reception headquarters.', x: 330, y: 970, w: 180, h: 720, shape: 'rect' },
  { id: 2, name: 'Academic block I', desc: 'Main academic building housing large lecture halls and faculty chambers.', x: 140, y: 970, w: 190, h: 510, shape: 'rect' },
  { id: 3, name: 'Srinivas institute of nursing sciences', desc: 'State-of-the-art training labs and classrooms for nursing education.', x: 440, y: 1720, w: 500, h: 160, shape: 'rect' },
  { id: 4, name: 'Srinivas college of pharmacy (NEXUS)', desc: 'Interactive classrooms and research labs for pharmaceutical sciences. This building houses the NEXUS Headquarters. Walk to the entrance and press SPACE or E in the game to access the central terminal.', x: 140, y: 760, w: 860, h: 180, shape: 'rect' },
  { id: 5, name: 'Academic block IV', desc: 'Advanced lecture halls and specialized research departments.', x: 1110, y: 950, w: 240, h: 170, shape: 'rect' },
  { id: 6, name: 'Academic block II', desc: 'Computing facilities, main server room, and software labs.', x: 140, y: 190, w: 340, h: 440, shape: 'rect' },
  { id: 7, name: 'Academic block III', desc: 'Large lecture halls, seminar rooms, and open courtyard.', x: 610, y: 320, w: 340, h: 320, shape: 'rect' },
  { id: 8, name: 'Mechanical work shop', desc: 'Heavy machinery, casting, and machining workshops.', x: 950, y: 980, w: 90, h: 440, shape: 'rect' },
  { id: 9, name: 'Automobile lab', desc: 'Hands-on practical workshop featuring engine assemblies and chassis testing.', x: 1830, y: 410, w: 100, h: 220, shape: 'rect' },
  { id: 10, name: 'Boys hostel', desc: 'Residential halls, dining mess, and lounges for male students.', x: 1450, y: 340, w: 380, h: 540, shape: 'rect' },
  { id: 11, name: 'Girls hostel', desc: 'Secure residential block with modern amenities and gardens for female students.', x: 140, y: 190, w: 340, h: 440, shape: 'rect' },
  { id: 12, name: 'Meditation center', desc: 'A quiet, peaceful pavilion designated for yoga and mindfulness.', x: 600, y: 700, w: 110, h: 100, shape: 'rect' },
  { id: 13, name: 'Priest quarters', desc: 'Living quarters for the temple priests and maintenance staff.', x: 1010, y: 1800, w: 70, h: 100, shape: 'rect' },
  { id: 14, name: 'Srinivasa temple', desc: 'Traditional temple offering a spiritual haven and cultural center on campus.', x: 750, y: 700, w: 110, h: 100, shape: 'rect' },
  { id: 15, name: 'ATM', desc: '24/7 banking kiosk for cash withdrawals and basic banking services.', x: 950, y: 760, w: 60, h: 60, shape: 'rect' },
  { id: 16, name: 'College ground', desc: 'Large athletic turf with a standard running track and football field.', cx: 1460, cy: 1540, rx: 380, ry: 220, shape: 'oval' },
  { id: 17, name: 'Post office', desc: 'Local post branch for campus mailing, packages, and logistics.', x: 180, y: 1510, w: 160, h: 100, shape: 'rect' },
  { id: 18, name: 'Generator room', desc: 'High-capacity generator facility supplying uninterrupted backup power.', x: 1840, y: 200, w: 100, h: 100, shape: 'rect' },
  { id: 19, name: 'Parking area', desc: 'Spacious vehicle parking slots for students, staff, and visitors.', x: 1140, y: 600, w: 220, h: 210, shape: 'rect' },
  { id: 20, name: 'Sewage treatment plant', desc: 'Eco-friendly water processing unit ensuring sustainable campus waste management.', x: 1030, y: 150, w: 140, h: 150, shape: 'rect' }
];

const MapOverlay = ({ playerPos }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFullLegend, setShowFullLegend] = useState(false);
  const [activeTab, setActiveTab] = useState('inspect'); // 'inspect' or 'directory'

  // Calibrate player coordinates to align with campus_map.png
  const calibratedPos = useMemo(() => {
    return mapCoordinates(playerPos.x, playerPos.y);
  }, [playerPos]);

  // Calculate scrolling minimap viewBox centered on the player's calibrated coordinates
  const miniViewBox = useMemo(() => {
    const size = 600; // view size in map coordinate units
    let vx = calibratedPos.x - size / 2;
    let vy = calibratedPos.y - size / 2;
    // Clamp to map boundaries
    vx = Math.max(0, Math.min(vx, MAP_SIZE - size));
    vy = Math.max(0, Math.min(vy, MAP_SIZE - size));
    return `${vx} ${vy} ${size} ${size}`;
  }, [calibratedPos]);

  // Filter buildings based on search query
  const filteredBuildings = useMemo(() => {
    if (!searchQuery) return BUILDINGS;
    return BUILDINGS.filter(b => 
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      b.id.toString() === searchQuery.trim()
    );
  }, [searchQuery]);

  // Render transparent interactive building hotspots
  const renderBuildingHotspot = (b, isInteractive) => {
    const isSelected = selectedBuilding?.id === b.id;
    const highlightProps = isInteractive ? {
      style: { cursor: 'pointer', transition: 'fill 0.2s, stroke 0.2s' },
      fill: isSelected ? 'rgba(96, 239, 255, 0.25)' : 'rgba(96, 239, 255, 0.0)',
      stroke: isSelected ? '#60efff' : 'rgba(96, 239, 255, 0.0)',
      strokeWidth: 3,
      onClick: () => {
        setSelectedBuilding(b);
        setActiveTab('inspect');
      }
    } : {
      fill: 'none',
      stroke: 'none'
    };

    if (b.shape === 'oval') {
      return (
        <ellipse
          key={b.id}
          cx={b.cx}
          cy={b.cy}
          rx={b.rx}
          ry={b.ry}
          {...highlightProps}
          className="map-building-hotspot"
        />
      );
    }

    return (
      <rect
        key={b.id}
        x={b.x}
        y={b.y}
        width={b.w}
        height={b.h}
        rx={6}
        ry={6}
        {...highlightProps}
        className="map-building-hotspot"
      />
    );
  };

  // Render building number badges at their centers
  const renderBuildingNumber = (b) => {
    let textX = b.x + b.w / 2;
    let textY = b.y + b.h / 2 + 5;
    
    if (b.shape === 'oval') {
      textX = b.cx;
      textY = b.cy + 5;
    }

    return (
      <g key={`num-${b.id}`} style={{ pointerEvents: 'none' }}>
        <circle cx={textX} cy={textY - 5} r={13} fill="rgba(0, 0, 0, 0.75)" stroke="#fff" strokeWidth={1} />
        <text
          x={textX}
          y={textY - 1}
          fill="#fff"
          fontSize="11"
          fontWeight="bold"
          textAnchor="middle"
          fontFamily="Inter, sans-serif"
        >
          {b.id}
        </text>
      </g>
    );
  };

  // Common SVG layout using campus_map.png as background
  const renderSvgContent = (isInteractive) => {
    return (
      <>
        {/* 1. Base Image Map */}
        <image href="/campus_map.png" x="0" y="0" width={MAP_SIZE} height={MAP_SIZE} />

        {/* 2. Interactive Building Overlays */}
        {BUILDINGS.map(b => renderBuildingHotspot(b, isInteractive))}

        {/* 3. Number Labels */}
        {BUILDINGS.map(b => renderBuildingNumber(b))}

        {/* 4. Calibrated Player Character Marker */}
        {calibratedPos && (
          <g key="player-marker">
            <circle cx={calibratedPos.x} cy={calibratedPos.y} r={28} fill="#ffeb3b" opacity={0.35}>
              <animate attributeName="r" values="18;34;18" dur="2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.5;0.1;0.5" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle cx={calibratedPos.x} cy={calibratedPos.y} r={10} fill="#f44336" stroke="#fff" strokeWidth={2.5} />
            <polygon points={`${calibratedPos.x},${calibratedPos.y - 18} ${calibratedPos.x - 6},${calibratedPos.y - 10} ${calibratedPos.x + 6},${calibratedPos.y - 10}`} fill="#f44336" stroke="#fff" strokeWidth={1} />
            <text x={calibratedPos.x} y={calibratedPos.y + 3} fill="#fff" fontSize="8" fontWeight="900" textAnchor="middle" fontFamily="'Inter', sans-serif">YOU</text>
          </g>
        )}
      </>
    );
  };

  return (
    <>
      {/* --- HUD MINI-MAP (Top Right) --- */}
      <div 
        style={styles.miniMapWrapper}
        onClick={() => setIsOpen(true)}
        title="Click to expand map"
      >
        <svg 
          viewBox={miniViewBox}
          style={styles.miniMapSvg}
        >
          {renderSvgContent(false)}
        </svg>
        <div style={styles.miniMapOverlay}>
          <span style={styles.miniMapLabel}>MAP</span>
          <span style={styles.miniMapExpandHint}>CLICK</span>
        </div>
      </div>

      {/* --- FULL MAP MODAL --- */}
      {isOpen && (
        <div style={styles.modalOverlay} onClick={() => setIsOpen(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            
            {/* Modal Header */}
            <div style={styles.modalHeader}>
              <div style={styles.modalTitleArea}>
                <h2 style={styles.modalTitle}>Srinivas Institute of Technology</h2>
                <p style={styles.modalSubtitle}>Valachil Campus Map & Directory</p>
              </div>
              <div style={styles.headerButtons}>
                <button 
                  style={styles.infoButton} 
                  onClick={() => setShowFullLegend(true)}
                  title="Display full building list"
                >
                  ℹ️ Campus Info
                </button>
                <button style={styles.closeButton} onClick={() => setIsOpen(false)}>
                  &times;
                </button>
              </div>
            </div>

            {/* Modal Main Area */}
            <div style={styles.modalBody}>
              {/* Map SVG (Left) */}
              <div style={styles.mapContainer}>
                <svg 
                  viewBox={`0 0 ${MAP_SIZE} ${MAP_SIZE}`}
                  style={styles.fullMapSvg}
                >
                  {renderSvgContent(true)}
                </svg>
              </div>

              {/* Sidebar directory (Right) */}
              <div style={styles.sidebar}>
                {/* Search input */}
                <div style={styles.searchBox}>
                  <input 
                    type="text" 
                    placeholder="Search buildings (name or number)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={styles.searchInput}
                  />
                  {searchQuery && (
                    <button style={styles.clearSearchBtn} onClick={() => setSearchQuery('')}>&times;</button>
                  )}
                </div>

                {/* Tabs */}
                <div style={styles.tabContainer}>
                  <button 
                    style={activeTab === 'inspect' ? styles.activeTabBtn : styles.tabBtn} 
                    onClick={() => setActiveTab('inspect')}
                  >
                    Inspect
                  </button>
                  <button 
                    style={activeTab === 'directory' ? styles.activeTabBtn : styles.tabBtn} 
                    onClick={() => setActiveTab('directory')}
                  >
                    Directory ({BUILDINGS.length})
                  </button>
                </div>

                {/* Tab content */}
                <div style={styles.sidebarContent}>
                  {activeTab === 'inspect' ? (
                    <div style={styles.inspectPanel}>
                      {selectedBuilding ? (
                        <div style={styles.buildingDetailCard}>
                          <div style={styles.cardHeader}>
                            <span style={styles.buildingBadge}>{selectedBuilding.id}</span>
                            <h3 style={styles.buildingDetailName}>{selectedBuilding.name}</h3>
                          </div>
                          <div style={styles.cardDivider} />
                          <p style={styles.buildingDetailDesc}>{selectedBuilding.desc}</p>
                          <div style={styles.buildingCoordinates}>
                            <span>📍 Map Grid: X={selectedBuilding.x || selectedBuilding.cx}, Y={selectedBuilding.y || selectedBuilding.cy}</span>
                          </div>
                        </div>
                      ) : (
                        <div style={styles.emptyInspectState}>
                          <p>Click any building on the map or select from the Directory to inspect details.</p>
                          <div style={styles.startingLocationNotice}>
                            <span>💡 You spawned at: <strong>1. Administrative block</strong></span>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={styles.directoryList}>
                      {filteredBuildings.map(b => (
                        <div 
                          key={b.id} 
                          style={{
                            ...styles.directoryItem,
                            backgroundColor: selectedBuilding?.id === b.id ? 'rgba(96, 239, 255, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                            borderLeftColor: selectedBuilding?.id === b.id ? '#60efff' : 'transparent'
                          }}
                          onClick={() => {
                            setSelectedBuilding(b);
                            setActiveTab('inspect');
                          }}
                        >
                          <span style={styles.directoryBadge}>{b.id}</span>
                          <span style={styles.directoryName}>{b.name}</span>
                        </div>
                      ))}
                      {filteredBuildings.length === 0 && (
                        <p style={styles.noResultsText}>No buildings matching your search.</p>
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
              <button style={styles.closeLegendBtn} onClick={() => setShowFullLegend(false)}>&times;</button>
            </div>
            <div style={styles.legendBody}>
              <table style={styles.legendTable}>
                <thead>
                  <tr>
                    <th style={styles.thBadge}>#</th>
                    <th style={styles.thName}>Building / Facility Name</th>
                  </tr>
                </thead>
                <tbody>
                  {BUILDINGS.map(b => (
                    <tr 
                      key={b.id} 
                      style={styles.legendRow}
                      onClick={() => {
                        setSelectedBuilding(b);
                        setActiveTab('inspect');
                        setShowFullLegend(false);
                      }}
                    >
                      <td style={styles.tdBadge}>
                        <span style={styles.tableBadge}>{b.id}</span>
                      </td>
                      <td style={styles.tdName}>
                        <div style={styles.tableName}>{b.name}</div>
                        <div style={styles.tableDesc}>{b.desc}</div>
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
    transition: 'transform 0.2s, border-color 0.2s',
    userSelect: 'none',
    ':hover': {
      transform: 'scale(1.05)',
      borderColor: '#60efff'
    }
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
    backgroundColor: 'rgba(0, 0, 0, 0.82)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
    animation: 'fadeIn 0.25s ease-out'
  },
  modalContent: {
    background: 'rgba(23, 28, 41, 0.95)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '24px',
    boxShadow: '0 24px 64px rgba(0, 0, 0, 0.6)',
    width: '92vw',
    height: '88vh',
    maxWidth: '1050px',
    maxHeight: '750px',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    fontFamily: "'Inter', sans-serif"
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 24px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    background: 'rgba(15, 20, 31, 0.5)'
  },
  modalTitleArea: {
    display: 'flex',
    flexDirection: 'column'
  },
  modalTitle: {
    margin: 0,
    fontSize: '1.6rem',
    fontWeight: 700,
    fontFamily: "'Outfit', sans-serif",
    background: 'linear-gradient(90deg, #60efff, #0061ff)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
  },
  modalSubtitle: {
    margin: '4px 0 0 0',
    fontSize: '0.85rem',
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
    padding: '8px 16px',
    fontSize: '0.85rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background 0.2s',
    fontFamily: "'Inter', sans-serif",
    ':hover': {
      background: 'rgba(96, 239, 255, 0.25)'
    }
  },
  closeButton: {
    background: 'none',
    border: 'none',
    color: 'rgba(255,255,255,0.6)',
    fontSize: '28px',
    cursor: 'pointer',
    padding: '0 4px',
    lineHeight: 1,
    transition: 'color 0.2s',
    ':hover': {
      color: '#fff'
    }
  },
  modalBody: {
    flex: 1,
    display: 'flex',
    overflow: 'hidden',
    position: 'relative'
  },
  mapContainer: {
    flex: '1.4',
    background: '#151922',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    padding: '16px',
    position: 'relative'
  },
  fullMapSvg: {
    maxWidth: '100%',
    maxHeight: '100%',
    boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    backgroundColor: '#151922'
  },
  sidebar: {
    flex: '0.8',
    borderLeft: '1px solid rgba(255, 255, 255, 0.08)',
    display: 'flex',
    flexDirection: 'column',
    background: 'rgba(10, 14, 23, 0.3)'
  },
  searchBox: {
    padding: '16px',
    position: 'relative',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
  },
  searchInput: {
    width: '100%',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    padding: '10px 12px',
    color: '#fff',
    fontSize: '0.88rem',
    outline: 'none',
    fontFamily: "'Inter', sans-serif",
    transition: 'border-color 0.2s',
    ':focus': {
      borderColor: '#60efff'
    }
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
  tabContainer: {
    display: 'flex',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
  },
  tabBtn: {
    flex: 1,
    background: 'none',
    border: 'none',
    color: 'rgba(255,255,255,0.5)',
    padding: '12px',
    fontSize: '0.88rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    borderBottom: '2px solid transparent',
    transition: 'color 0.2s, border-color 0.2s',
    fontFamily: "'Inter', sans-serif"
  },
  activeTabBtn: {
    flex: 1,
    background: 'none',
    border: 'none',
    color: '#60efff',
    padding: '12px',
    fontSize: '0.88rem',
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
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '12px',
    padding: '16px',
    animation: 'slideIn 0.2s ease-out'
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '12px'
  },
  buildingBadge: {
    background: '#60efff',
    color: '#0a0e17',
    fontSize: '0.85rem',
    fontWeight: 'bold',
    padding: '4px 10px',
    borderRadius: '6px',
    fontFamily: "'Outfit', sans-serif"
  },
  buildingDetailName: {
    margin: 0,
    fontSize: '1.1rem',
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: "'Outfit', sans-serif"
  },
  cardDivider: {
    height: '1px',
    background: 'rgba(255,255,255,0.08)',
    marginBottom: '12px'
  },
  buildingDetailDesc: {
    margin: '0 0 16px 0',
    fontSize: '0.9rem',
    lineHeight: 1.6,
    color: 'rgba(255, 255, 255, 0.75)'
  },
  buildingCoordinates: {
    fontSize: '0.78rem',
    color: '#60efff',
    opacity: 0.8
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
    fontSize: '0.9rem',
    lineHeight: 1.6
  },
  startingLocationNotice: {
    marginTop: '20px',
    padding: '10px 14px',
    background: 'rgba(96, 239, 255, 0.08)',
    border: '1px solid rgba(96, 239, 255, 0.2)',
    borderRadius: '8px',
    color: '#60efff',
    fontSize: '0.8rem'
  },

  // Directory Styles
  directoryList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  directoryItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 12px',
    borderRadius: '8px',
    cursor: 'pointer',
    borderLeft: '3px solid transparent',
    transition: 'background 0.2s, border-left-color 0.2s',
    ':hover': {
      background: 'rgba(255,255,255,0.06)'
    }
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
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
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
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 110,
    animation: 'fadeIn 0.2s ease-out'
  },
  legendContent: {
    background: 'rgba(18, 23, 35, 0.98)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderRadius: '20px',
    boxShadow: '0 20px 48px rgba(0, 0, 0, 0.7)',
    width: '90vw',
    height: '80vh',
    maxWidth: '550px',
    maxHeight: '600px',
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
    transition: 'background 0.2s',
    ':hover': {
      background: 'rgba(255,255,255,0.02)'
    }
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
  tdBadge: {
    padding: '12px 8px',
    verticalAlign: 'top'
  },
  tdName: {
    padding: '12px 8px',
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
  }
};

// CSS styles injection for smooth transitions and hover glow on hotspots
if (typeof document !== 'undefined') {
  const styleTag = document.createElement('style');
  styleTag.innerHTML = `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes slideIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .map-building-hotspot:hover {
      fill: rgba(96, 239, 255, 0.18) !important;
      stroke: #60efff !important;
      stroke-width: 3px !important;
    }
  `;
  document.head.appendChild(styleTag);
}

export default MapOverlay;
