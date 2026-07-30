

const SplashScreen = ({ onPlay }) => {
  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <h1 style={styles.title}>VALLEY</h1>
        <p style={styles.subtitle}>Campus Exploration Protocol</p>
        <button style={styles.playButton} onClick={onPlay}>
          PLAY GAME
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'linear-gradient(135deg, #1a1f2b 0%, #0d1117 100%)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: '#fff',
    fontFamily: "'Inter', sans-serif",
    zIndex: 50,
  },
  content: {
    textAlign: 'center',
    background: 'rgba(255, 255, 255, 0.05)',
    padding: '60px 100px',
    borderRadius: '24px',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
    animation: 'fadeInUp 0.8s ease-out',
  },
  title: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '5rem',
    fontWeight: 800,
    margin: '0 0 10px 0',
    letterSpacing: '8px',
    background: 'linear-gradient(90deg, #60efff, #0061ff)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  subtitle: {
    fontSize: '1.2rem',
    color: 'rgba(255, 255, 255, 0.6)',
    letterSpacing: '2px',
    marginBottom: '40px',
    textTransform: 'uppercase',
  },
  playButton: {
    background: 'linear-gradient(90deg, #0061ff, #60efff)',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    padding: '16px 48px',
    fontSize: '1.2rem',
    fontWeight: 700,
    cursor: 'pointer',
    letterSpacing: '1px',
    transition: 'transform 0.2s, box-shadow 0.2s',
    boxShadow: '0 10px 20px rgba(0, 97, 255, 0.3)',
  }
};

// Simple global animation style injected
const styleSheet = document.createElement("style");
styleSheet.innerText = `
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;
document.head.appendChild(styleSheet);

export default SplashScreen;
