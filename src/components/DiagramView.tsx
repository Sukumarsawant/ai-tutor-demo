import { useEffect, useRef, useState, useCallback } from 'react';
import mermaid from 'mermaid';

// Initialize mermaid with dark theme
mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  themeVariables: {
    primaryColor: '#3b82f6',
    primaryTextColor: '#fff',
    primaryBorderColor: '#60a5fa',
    lineColor: '#94a3b8',
    secondaryColor: '#1e293b',
    tertiaryColor: '#0f172a',
    background: '#0a0a0a',
    mainBkg: '#1e293b',
    nodeBorder: '#60a5fa',
    clusterBkg: '#1e293b',
    clusterBorder: '#60a5fa',
    titleColor: '#fff',
    edgeLabelBackground: '#1e293b',
  },
  flowchart: {
    nodeSpacing: 50,
    rankSpacing: 60,
    curve: 'basis',
    padding: 20,
  },
  securityLevel: 'loose',
});

interface DiagramViewProps {
  diagramCode: string;
}

export default function DiagramView({ diagramCode }: DiagramViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState(false);
  const [zoom, setZoom] = useState(1);

  const renderDiagram = useCallback(async () => {
    if (!containerRef.current || !diagramCode) return;

    setIsRendering(true);
    setError(null);

    try {
      // Clear previous content
      containerRef.current.innerHTML = '';

      // Validate and render
      const id = `mermaid-${Date.now()}`;
      const { svg } = await mermaid.render(id, diagramCode);
      
      if (containerRef.current) {
        containerRef.current.innerHTML = svg;
        
        // Style the SVG
        const svgElement = containerRef.current.querySelector('svg');
        if (svgElement) {
          svgElement.style.maxWidth = '100%';
          svgElement.style.height = 'auto';
          svgElement.style.margin = '0 auto';
          svgElement.style.display = 'block';
        }
      }
    } catch (err) {
      console.error('Mermaid render error:', err);
      setError(err instanceof Error ? err.message : 'Failed to render diagram');
    } finally {
      setIsRendering(false);
    }
  }, [diagramCode]);

  useEffect(() => {
    renderDiagram();
    setZoom(1); // Reset zoom on new diagram
  }, [renderDiagram]);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.25));
  const handleResetZoom = () => setZoom(1);

  return (
    <div className="diagram-view">
      <div className="diagram-header">
        <span className="diagram-label">Diagram Output</span>
        <div className="zoom-controls">
          <button className="zoom-btn" onClick={handleZoomOut} title="Zoom Out">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="M21 21l-4.35-4.35M8 11h6"/>
            </svg>
          </button>
          <button className="zoom-btn zoom-reset" onClick={handleResetZoom} title="Reset Zoom">
            {Math.round(zoom * 100)}%
          </button>
          <button className="zoom-btn" onClick={handleZoomIn} title="Zoom In">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="M21 21l-4.35-4.35M11 8v6M8 11h6"/>
            </svg>
          </button>
        </div>
      </div>
      
      <div className="diagram-content">
        {isRendering && (
          <div className="diagram-loading">Rendering diagram...</div>
        )}
        
        {error && (
          <div className="diagram-error">
            <div className="error-title">Render Error</div>
            <div className="error-message">{error}</div>
            <div className="error-code">
              <pre>{diagramCode}</pre>
            </div>
          </div>
        )}
        
        {!diagramCode && !error && (
          <div className="diagram-placeholder">
            <div className="placeholder-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <path d="M3 9h18M9 21V9"/>
              </svg>
            </div>
            <div className="placeholder-text">
              Ask a question to generate a diagram
            </div>
            <div className="placeholder-hint">
              Example: "Explain how a computer works"
            </div>
          </div>
        )}
        
        <div 
          ref={containerRef} 
          className="diagram-container"
          style={{ 
            display: diagramCode && !error ? 'block' : 'none',
            transform: `scale(${zoom})`,
            transformOrigin: 'center top'
          }}
        />
      </div>
    </div>
  );
}
