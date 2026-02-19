import { useState } from 'react';
import { Canvas } from './components/Canvas';
import { Chat } from './components/Chat';
import DiagramView from './components/DiagramView';
import type { TutorState } from './types';
import './App.css';

export type ViewMode = 'canvas' | 'diagram';

function App() {
  const [tutorState, setTutorState] = useState<TutorState>({
    isListening: false,
    isSpeaking: false,
    isProcessing: false,
  });
  
  const [viewMode, setViewMode] = useState<ViewMode>('diagram');
  const [diagramCode, setDiagramCode] = useState<string>('');

  const toggleMode = () => {
    setViewMode(prev => prev === 'canvas' ? 'diagram' : 'canvas');
  };

  return (
    <div className="app">
      {/* View Mode Toggle - Like Dark/Light Mode Switch */}
      <div className="view-toggle-bar">
        <div className="mode-switch" onClick={toggleMode}>
          <div className={`switch-track ${viewMode}`}>
            <div className="switch-thumb" />
          </div>
          <span className="switch-label-left">Canvas</span>
          <span className="switch-label-right">Diagram</span>
        </div>
        <div className="mode-indicator">
          {viewMode === 'canvas' ? (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 19l7-7 3 3-7 7-3-3z"/>
                <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/>
              </svg>
              Real-time Drawing
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7"/>
                <rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/>
              </svg>
              Mermaid Diagram
            </>
          )}
        </div>
      </div>
      
      <main className="app-main">
        <div className="canvas-panel">
          {viewMode === 'canvas' ? (
            <Canvas />
          ) : (
            <DiagramView diagramCode={diagramCode} />
          )}
        </div>
        <div className="chat-panel">
          <Chat 
            tutorState={tutorState} 
            setTutorState={setTutorState}
            viewMode={viewMode}
            onDiagramGenerated={setDiagramCode}
          />
        </div>
      </main>
    </div>
  );
}

export default App;
