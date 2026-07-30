

const NexusModal = ({ onClose }) => {
  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h2 style={styles.title}>NEXUS Headquarters</h2>
          <button style={styles.closeButton} onClick={onClose}>&times;</button>
        </div>
        
        <div style={styles.content}>
          <p style={styles.address}>
            <strong>Internal Address:</strong> Sector 7G, Main Campus Grid
          </p>
          <div style={styles.details}>
            <p><strong>Status:</strong> Operational</p>
            <p><strong>Access Level:</strong> Verified Player</p>
            <p>Welcome to the core operations center. All systems are currently nominal. Please check in with the central terminal for your next assignment.</p>
          </div>
          
          <button style={styles.cta}>
            Access Central Terminal
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    backdropFilter: 'blur(4px)',
    animation: 'fadeIn 0.3s ease-out',
  },
  modal: {
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.3)',
    width: '400px',
    maxWidth: '90%',
    padding: '24px',
    color: '#fff',
    fontFamily: "'Inter', sans-serif",
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    paddingBottom: '12px',
  },
  title: {
    margin: 0,
    fontSize: '1.5rem',
    fontWeight: 600,
    letterSpacing: '1px',
    fontFamily: "'Outfit', sans-serif",
    background: 'linear-gradient(90deg, #60efff, #0061ff)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  closeButton: {
    background: 'none',
    border: 'none',
    color: 'rgba(255,255,255,0.7)',
    fontSize: '24px',
    cursor: 'pointer',
    padding: '0',
    lineHeight: 1,
    transition: 'color 0.2s',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    fontSize: '0.95rem',
    lineHeight: 1.6,
  },
  address: {
    margin: 0,
    padding: '8px 12px',
    background: 'rgba(0, 0, 0, 0.2)',
    borderRadius: '8px',
    borderLeft: '3px solid #60efff',
  },
  details: {
    color: 'rgba(255, 255, 255, 0.85)',
  },
  cta: {
    marginTop: '8px',
    padding: '12px 24px',
    background: 'linear-gradient(90deg, #0061ff, #60efff)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
    boxShadow: '0 4px 15px rgba(0, 97, 255, 0.4)',
  }
};

export default NexusModal;
