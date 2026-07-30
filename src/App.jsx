import { useState } from 'react';
import GameCanvas from './components/GameCanvas';
import NexusModal from './components/NexusModal';
import SplashScreen from './components/SplashScreen';
import GithubModal from './components/GithubModal';
import './App.css';

function App() {
  const [activeModal, setActiveModal] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleInteract = (type) => {
    if (!activeModal) {
      setActiveModal(type);
    }
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  return (
    <div 
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '100vh',
        height: isPlaying ? '100vh' : 'auto',
        overflowX: 'hidden',
        overflowY: isPlaying ? 'hidden' : 'auto',
        backgroundColor: 'var(--bg-canvas)'
      }}
    >
      {!isPlaying && <SplashScreen onPlay={() => setIsPlaying(true)} />}

      {isPlaying && (
        <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
          {/* Top Bar Return Button */}
          <div style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            zIndex: 90
          }}>
            <button 
              className="btn-ghost" 
              onClick={() => setIsPlaying(false)}
              style={{
                backgroundColor: 'rgba(253, 251, 247, 0.9)',
                fontSize: '0.8rem',
                padding: '6px 14px'
              }}
            >
              ⬅ EXIT TO LANDING PAGE
            </button>
          </div>

          <GameCanvas onInteract={handleInteract} />
          {activeModal === 'nexus' && <NexusModal onClose={closeModal} />}
          {activeModal === 'github_sign' && <GithubModal onClose={closeModal} />}
        </div>
      )}
    </div>
  );
}

export default App;

