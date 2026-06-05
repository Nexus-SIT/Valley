import { useState } from 'react';
import GameCanvas from './components/GameCanvas';
import NexusModal from './components/NexusModal';
import './App.css'; // Optional if you have app specific styles

function App() {
  const [showModal, setShowModal] = useState(false);

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
    <div style={{ position: 'relative', width: '800px', height: '600px' }}>
      <GameCanvas onNexusInteract={handleNexusInteract} />
      {showModal && <NexusModal onClose={closeModal} />}
    </div>
  );
}

export default App;
