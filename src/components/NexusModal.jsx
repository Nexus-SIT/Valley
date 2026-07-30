

const NexusModal = ({ onClose }) => {
  return (
    <div style={styles.overlay}>
      <div className="dialogue-card" style={styles.modal}>
        <div style={styles.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="inventory-chip" style={{ backgroundColor: 'var(--accent-harvest)', color: '#fff' }}>[LOCATION]</span>
            <h2 className="pixel-font" style={styles.title}>NEXUS HQ</h2>
          </div>
          <button style={styles.closeButton} onClick={onClose}>&times;</button>
        </div>
        
        <div style={styles.content}>
          <div style={styles.address}>
            <span className="pixel-font" style={{ fontSize: '9px', display: 'block', marginBottom: '4px' }}>INTERNAL ADDRESS:</span>
            <strong>Sector 7G, Main Campus Grid</strong>
          </div>

          <div style={styles.details}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <span className="inventory-chip" style={{ backgroundColor: '#D1E7DD', color: 'var(--accent-forest)' }}>STATUS: OPERATIONAL</span>
              <span className="inventory-chip">LEVEL 1 VERIFIED</span>
            </div>
            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              Welcome to the core operations center. All systems are currently nominal. Please check in with the central terminal for your next campus assignment.
            </p>
          </div>
          
          <button className="btn-primary" onClick={onClose} style={{ width: '100%', marginTop: '8px' }}>
            ACCESS CENTRAL TERMINAL ➔
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
    backgroundColor: 'rgba(61, 40, 23, 0.4)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  modal: {
    width: '420px',
    maxWidth: '90%',
    padding: '24px',
    color: 'var(--text-primary)',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '2px solid var(--border-box)',
    paddingBottom: '12px',
  },
  title: {
    margin: 0,
    fontSize: '1.1rem',
    color: 'var(--text-primary)',
  },
  closeButton: {
    background: 'none',
    border: 'none',
    color: 'var(--text-primary)',
    fontSize: '24px',
    cursor: 'pointer',
    padding: '0',
    lineHeight: 1,
    fontWeight: 'bold'
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  address: {
    padding: '10px 14px',
    backgroundColor: 'var(--bg-inventory)',
    border: '1px solid var(--border-box)',
    borderRadius: '4px',
  },
  details: {
    lineHeight: 1.5,
  }
};

export default NexusModal;

