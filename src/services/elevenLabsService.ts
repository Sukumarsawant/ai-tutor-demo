// ElevenLabs TTS Service - High quality AI voices
// Uses streaming for faster response

const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY || '';

// Voice IDs from ElevenLabs
const VOICES = {
  rachel: '21m00Tcm4TlvDq8ikWAM',    // Rachel - calm, warm female
  adam: 'pNInz6obpgDQGcFmaJgB',       // Adam - deep male
  josh: 'TxGEqnHWrfWFTfGW9XjX',       // Josh - young male
  bella: 'EXAVITQu4vr4xnSDxMaL',      // Bella - soft female
  arnold: 'VR6AewLTigWG4xSOukaG',     // Arnold - crisp male
  domi: 'AZnzlk1XvdvUeBnXmlld',       // Domi - strong female
};

// Default voice - Rachel is great for teaching
const DEFAULT_VOICE_ID = VOICES.rachel;

class ElevenLabsService {
  private audioContext: AudioContext | null = null;
  private currentSource: AudioBufferSourceNode | null = null;
  private isPlaying = false;

  constructor() {
    // Initialize audio context on first user interaction
    if (typeof window !== 'undefined') {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  async speak(text: string, onEnd?: () => void): Promise<void> {
    if (!ELEVENLABS_API_KEY) {
      console.warn('ElevenLabs API key not configured, falling back to Web Speech');
      return this.fallbackSpeak(text, onEnd);
    }

    try {
      this.stop(); // Stop any current playback
      
      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${DEFAULT_VOICE_ID}`,
        {
          method: 'POST',
          headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': ELEVENLABS_API_KEY,
          },
          body: JSON.stringify({
            text: text,
            model_id: 'eleven_monolingual_v1',
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75,
              style: 0.0,
              use_speaker_boost: true
            }
          }),
        }
      );

      if (!response.ok) {
        console.error('ElevenLabs API error:', response.status);
        return this.fallbackSpeak(text, onEnd);
      }

      const audioData = await response.arrayBuffer();
      await this.playAudio(audioData, onEnd);
    } catch (error) {
      console.error('ElevenLabs error:', error);
      return this.fallbackSpeak(text, onEnd);
    }
  }

  private async playAudio(audioData: ArrayBuffer, onEnd?: () => void): Promise<void> {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    // Resume context if suspended
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }

    try {
      const audioBuffer = await this.audioContext.decodeAudioData(audioData);
      
      this.currentSource = this.audioContext.createBufferSource();
      this.currentSource.buffer = audioBuffer;
      this.currentSource.connect(this.audioContext.destination);
      
      this.isPlaying = true;
      
      this.currentSource.onended = () => {
        this.isPlaying = false;
        this.currentSource = null;
        onEnd?.();
      };

      this.currentSource.start(0);
    } catch (error) {
      console.error('Audio playback error:', error);
      this.isPlaying = false;
      onEnd?.();
    }
  }

  // Fallback to Web Speech API
  private fallbackSpeak(text: string, onEnd?: () => void): Promise<void> {
    return new Promise((resolve) => {
      const synthesis = window.speechSynthesis;
      synthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      const voices = synthesis.getVoices();
      const preferredVoice = voices.find(v => 
        v.name.includes('Google') || v.name.includes('Natural') || v.lang.startsWith('en')
      );
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onend = () => {
        onEnd?.();
        resolve();
      };

      utterance.onerror = () => {
        onEnd?.();
        resolve();
      };

      synthesis.speak(utterance);
    });
  }

  stop(): void {
    if (this.currentSource) {
      try {
        this.currentSource.stop();
      } catch (e) {
        // Ignore if already stopped
      }
      this.currentSource = null;
    }
    this.isPlaying = false;
    
    // Also stop any fallback speech
    window.speechSynthesis?.cancel();
  }

  isSpeaking(): boolean {
    return this.isPlaying || window.speechSynthesis?.speaking;
  }

  isConfigured(): boolean {
    return !!ELEVENLABS_API_KEY;
  }
}

export const elevenLabsService = new ElevenLabsService();
