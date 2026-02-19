export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface DrawCommand {
  type: 'circle' | 'rectangle' | 'diamond' | 'hexagon' | 'ellipse' | 'star' | 'arrow' | 'text' | 'line' | 'freehand';
  x: number;
  y: number;
  props?: {
    w?: number;
    h?: number;
    radius?: number;
    text?: string;
    color?: string;
    start?: { x: number; y: number };
    end?: { x: number; y: number };
    points?: { x: number; y: number }[];
  };
}

export interface AIResponse {
  explanation: string;
  drawCommands?: DrawCommand[];
  narration?: string;
}

export interface TutorState {
  isListening: boolean;
  isSpeaking: boolean;
  isProcessing: boolean;
}
