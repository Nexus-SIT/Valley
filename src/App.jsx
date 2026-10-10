import { useState, useRef, useCallback } from 'react';
import PhaserGame from './game/phaser/PhaserGame';
import NexusModal from './components/NexusModal';
import SplashScreen from './components/SplashScreen';
import GithubModal from './components/GithubModal';
import OnScreenControls from './components/OnScreenControls';
import './App.css';

function App() {
  const [activeModal, setActiveModal] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const controlsRef = useRef(null);

  const handleInteract = (type) => {
    if (!activeModal) {
      setActiveModal(type);
    }
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  const handleMove = useCallback((x, y) => {
    controlsRef.current?.setAxis?.(x, y);
  }, []);

  const handleAttack = useCallback(() => {
    controlsRef.current?.attack?.();
  }, []);

  const handleVirtualInteract = useCallback(() => {
    controlsRef.current?.interact?.();
  }, []);

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

          <PhaserGame onInteract={handleInteract} controlsRef={controlsRef} />

          {/* Mobile & Desktop On-Screen Controls */}
          <OnScreenControls 
            onMove={handleMove}
            onAttack={handleAttack}
            onInteract={handleVirtualInteract}
          />

          {activeModal === 'nexus' && <NexusModal onClose={closeModal} />}
          {activeModal === 'github_sign' && <GithubModal onClose={closeModal} />}
        </div>
      )}
    </div>
  );
}

export default App;

