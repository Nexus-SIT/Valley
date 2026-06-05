import { useState } from 'react';
import GameCanvas from './components/GameCanvas';
import NexusModal from './components/NexusModal';
import SplashScreen from './components/SplashScreen';
import GithubModal from './components/GithubModal';
import './App.css'; // Optional if you have app specific styles

function App() {
  const [activeModal, setActiveModal] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleInteract = (type) => {
    // Prevent multiple triggers
    if (!activeModal) {
      setActiveModal(type);
    }
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', backgroundColor: '#000' }}>
      {!isPlaying && <SplashScreen onPlay={() => setIsPlaying(true)} />}
      {isPlaying && (
        <>
          <GameCanvas onInteract={handleInteract} />
          {activeModal === 'nexus' && <NexusModal onClose={closeModal} />}
          {activeModal === 'github_sign' && <GithubModal onClose={closeModal} />}
        </>
      )}
    </div>
  );
}

export default App;
