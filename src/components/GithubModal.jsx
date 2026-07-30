

const GithubModal = ({ onClose }) => {
  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h2 style={styles.title}>Message Found!</h2>
          <button style={styles.closeBtn} onClick={onClose}>×</button>
        </div>
        <div style={styles.body}>
          <p style={styles.text}>
            "Hey! This is a work in progress. Help me build this game!"
          </p>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            style={styles.githubBtn}
          >
            {/* Simple GitHub SVG Logo */}
            <svg height="24" width="24" viewBox="0 0 16 16" style={{ fill: '#fff', marginRight: '8px' }}>
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
            </svg>
            Contribute on GitHub
          </a>
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
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
    fontFamily: "'Inter', sans-serif",
  },
  modal: {
    background: 'linear-gradient(135deg, #1f2937, #111827)',
    borderRadius: '16px',
    padding: '30px',
    width: '400px',
    maxWidth: '90%',
    color: '#fff',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    paddingBottom: '15px',
    marginBottom: '20px',
  },
  title: {
    margin: 0,
    fontSize: '1.5rem',
    fontWeight: 'bold',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: '1.8rem',
    cursor: 'pointer',
    padding: 0,
    lineHeight: 1,
  },
  body: {
    textAlign: 'center',
  },
  text: {
    fontSize: '1.1rem',
    lineHeight: '1.5',
    marginBottom: '30px',
    color: '#e5e7eb',
  },
  githubBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    background: '#2ea44f',
    color: '#fff',
    textDecoration: 'none',
    padding: '12px 24px',
    borderRadius: '8px',
    fontSize: '1.1rem',
    fontWeight: '600',
    transition: 'background 0.2s',
  }
};

export default GithubModal;
