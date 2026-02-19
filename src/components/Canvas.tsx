import { useEffect, useCallback } from 'react';
import { Tldraw, Editor } from 'tldraw';
import 'tldraw/tldraw.css';
import { drawingController } from '../services/drawingController';

interface CanvasProps {
  onEditorReady?: (editor: Editor) => void;
}

export function Canvas({ onEditorReady }: CanvasProps) {
  const handleMount = useCallback((editor: Editor) => {
    // Register the editor with the drawing controller
    drawingController.setEditor(editor);
    
    // Notify parent component
    onEditorReady?.(editor);
    
    // Set initial camera position for better view
    editor.setCamera({ x: 0, y: 0, z: 1 });
  }, [onEditorReady]);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      drawingController.setEditor(null as any);
    };
  }, []);

  return (
    <div className="canvas-container">
      <div className="canvas-wrapper">
        <Tldraw
          onMount={handleMount}
          hideUi={false}
          inferDarkMode={true}
        />
      </div>
    </div>
  );
}
