import { useState, useRef, useEffect } from 'react';
import type { Message, TutorState } from '../types';
import { getAIResponse, getMermaidResponse, isAPIKeyConfigured, resetTopicContext } from '../services/aiService';
import { speechService } from '../services/speechService';
import { drawingController } from '../services/drawingController';
import { stepSyncController } from '../services/stepSyncController';
import { findPreGeneratedTopic, getQuickPrompts } from '../services/preGeneratedTopics';
import type { ViewMode } from '../App';

interface ChatProps {
  tutorState: TutorState;
  setTutorState: React.Dispatch<React.SetStateAction<TutorState>>;
  viewMode: ViewMode;
  onDiagramGenerated: (code: string) => void;
}

export function Chat({ tutorState, setTutorState, viewMode, onDiagramGenerated }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I'm your AI tutor. Ask me anything and I'll explain with visual diagrams.\n\nTry the quick prompts below or ask your own question!",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [taskBreakdown, setTaskBreakdown] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState<number>(-1);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [conversationHistory, setConversationHistory] = useState<
    { role: 'user' | 'assistant'; content: string }[]
  >([]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const quickPrompts = getQuickPrompts();

  const handleSend = async (overrideInput?: string) => {
    const messageText = overrideInput || input.trim();
    if (!messageText || tutorState.isProcessing) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setTutorState({ ...tutorState, isProcessing: true });
    setTaskBreakdown([]);
    setCurrentStep(-1);

    try {
      // DIAGRAM MODE - Generate Mermaid diagram (no stepwise, output whole diagram)
      if (viewMode === 'diagram') {
        if (!isAPIKeyConfigured()) {
          throw new Error('API key not configured');
        }

        const response = await getMermaidResponse(messageText, conversationHistory);

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: response.explanation,
          timestamp: new Date(),
        };

        setMessages(prev => [...prev, assistantMessage]);
        setConversationHistory(prev => [
          ...prev,
          { role: 'user', content: messageText },
          { role: 'assistant', content: response.explanation },
        ]);

        // Send diagram to parent - whole diagram at once
        onDiagramGenerated(response.mermaidCode);

        // Speak the explanation
        setTutorState({ isProcessing: false, isSpeaking: true, isListening: false });
        await speechService.speak(response.explanation, () => {
          setTutorState(prev => ({ ...prev, isSpeaking: false }));
        });
      }
      // CANVAS MODE - Real-time drawing
      else {
        // Check for pre-generated topic first (instant response)
        const preGenerated = findPreGeneratedTopic(messageText);
        
        if (preGenerated) {
          // Use pre-generated content with step-by-step sync
          drawingController.clearCanvas();
          
          setTaskBreakdown(preGenerated.taskBreakdown);

          const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: preGenerated.explanation,
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, assistantMessage]);
          setConversationHistory(prev => [
            ...prev,
            { role: 'user', content: messageText },
            { role: 'assistant', content: preGenerated.explanation },
          ]);

          setTutorState({ isProcessing: false, isSpeaking: true, isListening: false });

          // Execute with step-by-step sync
          await stepSyncController.executeSteps(
            preGenerated.steps,
            (stepIndex) => setCurrentStep(stepIndex),
            () => {
              setTutorState(prev => ({ ...prev, isSpeaking: false }));
              setCurrentStep(-1);
            }
          );
        } else {
          // Use AI API for non-pre-generated queries
          if (!isAPIKeyConfigured()) {
            throw new Error('API key not configured');
          }

          const response = await getAIResponse(messageText, conversationHistory);

          if (response.taskBreakdown && response.taskBreakdown.length > 0) {
            setTaskBreakdown(response.taskBreakdown);
          }

          if (response.isNewTopic) {
            drawingController.clearCanvas();
          }

          const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: response.explanation,
            timestamp: new Date(),
          };

          setMessages(prev => [...prev, assistantMessage]);
          setConversationHistory(prev => [
            ...prev,
            { role: 'user', content: messageText },
            { role: 'assistant', content: response.explanation },
          ]);

          setTutorState({ isProcessing: false, isSpeaking: true, isListening: false });

          // Execute with improved sync
          await stepSyncController.executeAIResponse(
            response.narration,
            response.drawCommands,
            () => {},
            () => setTutorState(prev => ({ ...prev, isSpeaking: false }))
          );
        }
      }
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: isAPIKeyConfigured() 
          ? 'Something went wrong. Please try again.'
          : 'API Key Required. Please add your OpenAI API key to the .env file.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
      setTutorState(prev => ({ ...prev, isProcessing: false }));
    }
  };

  const handleVoiceInput = () => {
    if (tutorState.isListening) {
      speechService.stopListening();
      setTutorState({ ...tutorState, isListening: false });
    } else {
      const success = speechService.startListening(
        (transcript) => {
          setInput(transcript);
          setTutorState(prev => ({ ...prev, isListening: false }));
        },
        (isListening) => {
          setTutorState(prev => ({ ...prev, isListening }));
        }
      );
      
      if (!success) {
        alert('Speech recognition not supported. Use Chrome or Edge.');
      }
    }
  };

  const handleStop = () => {
    stepSyncController.stop();
    speechService.stopSpeaking();
    speechService.stopListening();
    setTutorState({ isProcessing: false, isSpeaking: false, isListening: false });
    setCurrentStep(-1);
  };

  const handleClearCanvas = () => {
    if (viewMode === 'canvas') {
      drawingController.clearCanvas();
    } else {
      onDiagramGenerated('');
    }
    resetTopicContext();
    setTaskBreakdown([]);
    setCurrentStep(-1);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isActive = tutorState.isProcessing || tutorState.isSpeaking || tutorState.isListening;

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="header-left">
          <span className="chat-title">Ai tutor</span>
          <button className="clear-canvas-btn" onClick={handleClearCanvas} title="Clear canvas">
            Clear
          </button>
        </div>
        <div className="status-indicators">
          {tutorState.isProcessing && <span className="clear-canvas-btn">Thinking...</span>}
          {tutorState.isSpeaking && <span className="clear-canvas-btn">Speaking...</span>}
          {tutorState.isListening && <span className="status listening">Listening...</span>}
          {isActive && (
            <button className="stop-btn" onClick={handleStop} title="Stop">
              Stop
            </button>
          )}
        </div>
      </div>

      {taskBreakdown.length > 0 && (
        <div className="task-breakdown">
          <div className="task-title">Learning Steps</div>
          {taskBreakdown.map((task, i) => (
            <div 
              key={i} 
              className={`task-item ${currentStep === i ? 'active' : ''} ${currentStep > i ? 'completed' : ''}`}
            >
              {task}
            </div>
          ))}
        </div>
      )}

      {/* Quick Prompts */}
      {messages.length <= 1 && (
        <div className="quick-prompts">
          <div className="quick-prompts-title">Try these:</div>
          <div className="quick-prompts-list">
            {quickPrompts.map((prompt, i) => (
              <button
                key={i}
                className="quick-prompt-btn"
                onClick={() => handleSend(prompt.query)}
                disabled={tutorState.isProcessing}
              >
                {prompt.label}
              </button>
            ))}
          </div>
        </div>
      )}
      
      <div className="messages-container">
        {messages.map((message) => (
          <div key={message.id} className={`message ${message.role}`}>
            <div className="message-content">
              {message.content.split('\n').map((line, i) => (
                <span key={i}>
                  {line}
                  {i < message.content.split('\n').length - 1 && <br />}
                </span>
              ))}
            </div>
            <div className="message-time">
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="input-container">
        <button
          className={`voice-btn ${tutorState.isListening ? 'listening' : ''}`}
          onClick={handleVoiceInput}
          disabled={tutorState.isProcessing}
          title={tutorState.isListening ? 'Stop listening' : 'Voice input'}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
            <line x1="12" y1="19" x2="12" y2="23"/>
            <line x1="8" y1="23" x2="16" y2="23"/>
          </svg>
        </button>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask me to explain something..."
          disabled={tutorState.isProcessing}
          rows={1}
        />
        <button
          className="send-btn"
          onClick={() => handleSend()}
          disabled={!input.trim() || tutorState.isProcessing}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="22" y1="2" x2="11" y2="13"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
