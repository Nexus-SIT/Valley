import { MAP_WIDTH, MAP_HEIGHT } from '../game/mapData';

const MiniMap = ({ gameState, onClick }) => {
  const { playerX, playerY } = gameState;

  // Scale calculations - converting world coordinates to percentage
  const pX = (playerX / MAP_WIDTH) * 100;
  const pY = (playerY / MAP_HEIGHT) * 100;

  return (
    <div 
      style={styles.wrapper}
      onClick={onClick}
      className="hud-minimap-btn"
      title="Click to open Interactive Campus Map"
    >
      <div style={styles.mapContainer}>
        <img 
          src="/campus_map.png" 
          alt="Minimap Background" 
          style={styles.image} 
          draggable={false}
        />
        
        {/* Black User Location Pin Icon (Matching image) */}
        <div style={{
          ...styles.playerMarker,
          left: `${pX}%`,
          top: `${pY}%`,
        }}>
          <svg 
            width="12" 
            height="14" 
            viewBox="0 0 24 28" 
            fill="none" 
            style={styles.locationPinSvg}
          >
            {/* Black Map Pin Teardrop Body with White Outline */}
            <path 
              d="M12 0C5.37 0 0 5.37 0 12C0 21 12 28 12 28C12 28 24 21 24 12C24 5.37 18.63 0 12 0Z" 
              fill="#111827" 
              stroke="#ffffff" 
              strokeWidth="1.5"
            />
            {/* Inner White Circle */}
            <circle cx="12" cy="11" r="7" fill="#ffffff" />
            {/* Black Person Silhouette Head */}
            <circle cx="12" cy="9.2" r="2.8" fill="#111827" />
            {/* Black Person Silhouette Body */}
            <path 
              d="M7.5 15.5C7.5 13.5 9.5 12.5 12 12.5C14.5 12.5 16.5 13.5 16.5 15.5" 
              stroke="#111827" 
              strokeWidth="2.2" 
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>
      
      <div style={styles.overlay}>
        <span style={styles.label}>MAP</span>
        <span style={styles.expandHint}>CLICK 🗺️</span>
      </div>
    </div>
  );
};

const styles = {
  wrapper: {
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
  mapContainer: {
    position: 'relative',
    width: '100%',
    height: '100%'
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'fill',
    display: 'block'
  },
  playerMarker: {
    position: 'absolute',
    pointerEvents: 'none',
    zIndex: 2,
  },
  locationPinSvg: {
    transform: 'translate(-50%, -100%)',
    filter: 'drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.8))'
  },
  overlay: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '8px',
    pointerEvents: 'none',
    background: 'linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.4) 100%)'
  },
  label: {
    color: '#fff',
    fontSize: '9px',
    fontWeight: 'bold',
    letterSpacing: '1.5px',
    textShadow: '0 1px 2px rgba(0,0,0,0.8)',
    fontFamily: "'Outfit', sans-serif"
  },
  expandHint: {
    color: '#60efff',
    fontSize: '8px',
    fontWeight: 'bold',
    alignSelf: 'flex-end',
    textShadow: '0 1px 2px rgba(0,0,0,0.8)',
    fontFamily: "'Inter', sans-serif",
    letterSpacing: '0.5px'
  }
};

export default MiniMap;
