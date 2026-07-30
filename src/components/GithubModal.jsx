import React from 'react';

const GithubModal = ({ onClose }) => {
  return (
    <div style={styles.overlay}>
      <div className="dialogue-card" style={styles.modal}>
        <div style={styles.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="inventory-chip" style={{ backgroundColor: 'var(--accent-harvest)', color: '#fff' }}>[MESSAGE]</span>
            <h2 className="pixel-font" style={styles.title}>NOTE FOUND!</h2>
          </div>
          <button style={styles.closeBtn} onClick={onClose}>×</button>
        </div>
        <div style={styles.body}>
          <div style={styles.noteBox}>
            <p style={styles.text}>
              "Hey explorer! This campus RPG is currently under active development. Join the project and help build features!"
            </p>
          </div>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
            style={{ width: '100%', textDecoration: 'none' }}
          >
            {/* Simple GitHub SVG Logo */}
            <svg height="20" width="20" viewBox="0 0 16 16" style={{ fill: '#fff', marginRight: '6px' }}>
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
            </svg>
            CONTRIBUTE ON GITHUB
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
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '2px solid var(--border-box)',
    paddingBottom: '12px',
    marginBottom: '16px',
  },
  title: {
    margin: 0,
    fontSize: '1.1rem',
    color: 'var(--text-primary)',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-primary)',
    fontSize: '24px',
    fontWeight: 'bold',
    cursor: 'pointer',
    padding: 0,
    lineHeight: 1,
  },
  body: {
    textAlign: 'center',
  },
  noteBox: {
    backgroundColor: 'var(--bg-inventory)',
    border: '1px solid var(--border-box)',
    borderRadius: '4px',
    padding: '16px',
    marginBottom: '20px',
  },
  text: {
    fontSize: '0.95rem',
    lineHeight: '1.5',
    margin: 0,
    color: 'var(--text-primary)',
    fontStyle: 'italic',
  }
};

export default GithubModal;

