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


          <GameCanvas onInteract={handleInteract} />
          {activeModal === 'nexus' && <NexusModal onClose={closeModal} />}
          {activeModal === 'github_sign' && <GithubModal onClose={closeModal} />}
        </div>
      )}
    </div>
  );
}

export default App;

