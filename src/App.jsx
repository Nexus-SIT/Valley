import { useState } from 'react';
import GameCanvas from './components/GameCanvas';
import NexusModal from './components/NexusModal';
import SplashScreen from './components/SplashScreen';
import './App.css'; // Optional if you have app specific styles

function App() {
  const [showModal, setShowModal] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleNexusInteract = () => {
    // Prevent multiple triggers
    if (!showModal) {
      setShowModal(true);
    }
  };

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', backgroundColor: '#000' }}>
      {!isPlaying && <SplashScreen onPlay={() => setIsPlaying(true)} />}
      {isPlaying && (
        <>
          <GameCanvas onNexusInteract={handleNexusInteract} />
          {showModal && <NexusModal onClose={closeModal} />}
        </>
      )}
    </div>
  );
}

export default App;
