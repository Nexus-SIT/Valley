
import { MAP_WIDTH, MAP_HEIGHT } from '../game/mapData';

const MiniMap = ({ gameState, onClick }) => {
  const { playerX, playerY, camX, camY, camW, camH } = gameState;

  // Scale calculations - converting world coordinates to percentage
  const pX = (playerX / MAP_WIDTH) * 100;
  const pY = (playerY / MAP_HEIGHT) * 100;
  
  const cX = (camX / MAP_WIDTH) * 100;
  const cY = (camY / MAP_HEIGHT) * 100;
  const cW = (camW / MAP_WIDTH) * 100;
  const cH = (camH / MAP_HEIGHT) * 100;

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
        
        {/* Camera Viewport Rectangle */}
        {camW > 0 && (
          <div style={{
            ...styles.viewport,
            left: `${cX}%`,
            top: `${cY}%`,
            width: `${cW}%`,
            height: `${cH}%`
          }} />
        )}
        
        {/* Player Marker */}
        <div style={{
          ...styles.playerMarker,
          left: `${pX}%`,
          top: `${pY}%`,
        }}>
          <div style={styles.playerPulse} />
          <div style={styles.playerDot} />
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
  viewport: {
    position: 'absolute',
    border: '1.5px solid rgba(255, 255, 255, 0.7)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.4)', // Darkens area outside viewport
    pointerEvents: 'none'
  },
  playerMarker: {
    position: 'absolute',
    width: '0',
    height: '0',
    pointerEvents: 'none',
    zIndex: 2,
    transform: 'translate(-50%, -50%)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  playerDot: {
    width: '6px',
    height: '6px',
    backgroundColor: '#f44336',
    border: '1px solid #fff',
    borderRadius: '50%',
    position: 'absolute'
  },
  playerPulse: {
    width: '14px',
    height: '14px',
    backgroundColor: '#ffeb3b',
    borderRadius: '50%',
    position: 'absolute',
    opacity: 0.5,
    animation: 'minimap-pulse 2s infinite' // Will add keyframes in css or ignore if undefined
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
