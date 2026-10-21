import { useState, useRef, useCallback, useEffect } from 'react';
import PhaserGame from './game/phaser/PhaserGame';
import NexusModal from './components/NexusModal';
import SplashScreen from './components/SplashScreen';
import GithubModal from './components/GithubModal';
import OnScreenControls from './components/OnScreenControls';
import RotateOrientationPrompt from './components/RotateOrientationPrompt';
import { isMobileDevice, isPortraitMode, requestLandscapeOrientation } from './utils/orientationHelper';
import './App.css';

function App() {
  const [activeModal, setActiveModal] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMobile, setIsMobile] = useState(() => isMobileDevice());
  const [isPortrait, setIsPortrait] = useState(() => isPortraitMode());
  const controlsRef = useRef(null);

  // Detect mobile device orientation changes
  useEffect(() => {
    const handleOrientationCheck = () => {
      setIsMobile(isMobileDevice());
      const portrait = isPortraitMode();
      setIsPortrait(portrait);
      if (portrait) {
        controlsRef.current?.setAxis?.(0, 0);
      }
    };

    window.addEventListener('resize', handleOrientationCheck);
    window.addEventListener('orientationchange', handleOrientationCheck);
    screen?.orientation?.addEventListener?.('change', handleOrientationCheck);

    return () => {
      window.removeEventListener('resize', handleOrientationCheck);
      window.removeEventListener('orientationchange', handleOrientationCheck);
      screen?.orientation?.removeEventListener?.('change', handleOrientationCheck);
    };
  }, []);

  const handleStartGame = async () => {
    // Attempt automatic landscape orientation lock
    await requestLandscapeOrientation();
    setIsPlaying(true);
  };

  const handleRequestLandscape = async () => {
    await requestLandscapeOrientation();
  };

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
      {!isPlaying && <SplashScreen onPlay={handleStartGame} />}

      {isPlaying && (
        <div className="valley-game-shell">
          {/* Mobile Portrait Rotation Modal Prompt */}
          {isMobile && isPortrait && (
            <RotateOrientationPrompt
              onExit={() => setIsPlaying(false)}
              onRequestLandscape={handleRequestLandscape}
            />
          )}

          {/* Top Bar Return Button */}
          <div style={{
            position: 'absolute',
            top: 'calc(10px + env(safe-area-inset-top, 0px))',
            right: 'calc(12px + env(safe-area-inset-right, 0px))',
            zIndex: 90
          }}>
            <button 
              className="valley-exit-btn" 
              onClick={() => setIsPlaying(false)}
              aria-label="Exit to landing page"
            >
              <span className="exit-text-long">⬅ EXIT TO LANDING PAGE</span>
              <span className="exit-text-short">⬅ EXIT</span>
            </button>
          </div>

          <PhaserGame onInteract={handleInteract} controlsRef={controlsRef} />

          {/* Mobile & Desktop On-Screen Controls (hidden when portrait rotation overlay is active) */}
          {(!isMobile || !isPortrait) && (
            <OnScreenControls 
              onMove={handleMove}
              onAttack={handleAttack}
              onInteract={handleVirtualInteract}
            />
          )}

          {activeModal === 'nexus' && <NexusModal onClose={closeModal} />}
          {activeModal === 'github_sign' && <GithubModal onClose={closeModal} />}
        </div>
      )}
    </div>
  );
}

export default App;

