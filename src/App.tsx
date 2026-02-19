import { useState } from 'react';
import { Canvas } from './components/Canvas';
import { Chat } from './components/Chat';
import type { TutorState } from './types';
import './App.css';

function App() {
  const [tutorState, setTutorState] = useState<TutorState>({
    isListening: false,
    isSpeaking: false,
    isProcessing: false,
  });

  return (
    <div className="app">
      <main className="app-main">
        <div className="canvas-panel">
          <Canvas />
        </div>
        <div className="chat-panel">
          <Chat tutorState={tutorState} setTutorState={setTutorState} />
        </div>
      </main>
    </div>
  );
}

export default App;
