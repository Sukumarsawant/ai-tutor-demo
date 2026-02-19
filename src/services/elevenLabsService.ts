// ElevenLabs TTS Service - High quality AI voices
// Uses Audio element for better browser compatibility

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
  private currentAudio: HTMLAudioElement | null = null;
  private isPlaying = false;

  constructor() {
    // Log configuration status on load
    console.log('🔊 ElevenLabs TTS configured:', !!ELEVENLABS_API_KEY);
    if (ELEVENLABS_API_KEY) {
      console.log('🔊 ElevenLabs API key found (length:', ELEVENLABS_API_KEY.length, ')');
    }
  }

  async speak(text: string, onEnd?: () => void): Promise<void> {
    if (!text || text.trim().length === 0) {
      onEnd?.();
      return;
    }

    // Truncate very long text (ElevenLabs has limits)
    const truncatedText = text.length > 1000 ? text.substring(0, 1000) + '...' : text;

    if (!ELEVENLABS_API_KEY || ELEVENLABS_API_KEY.length < 10) {
      console.warn('🔇 ElevenLabs API key not configured, using Web Speech');
      return this.fallbackSpeak(truncatedText, onEnd);
    }

    console.log('🔊 ElevenLabs: Speaking:', truncatedText.substring(0, 50) + '...');

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
            text: truncatedText,
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
        const errorText = await response.text();
        console.error('❌ ElevenLabs API error:', response.status, errorText);
        return this.fallbackSpeak(truncatedText, onEnd);
      }

      console.log('✅ ElevenLabs: Audio received, playing...');
      const audioBlob = await response.blob();
      await this.playAudioBlob(audioBlob, onEnd);
    } catch (error) {
      console.error('❌ ElevenLabs error:', error);
      return this.fallbackSpeak(truncatedText, onEnd);
    }
  }

  private async playAudioBlob(blob: Blob, onEnd?: () => void): Promise<void> {
    return new Promise((resolve) => {
      // Create audio element - more reliable than AudioContext
      this.currentAudio = new Audio();
      const audioUrl = URL.createObjectURL(blob);
      
      this.currentAudio.src = audioUrl;
      this.isPlaying = true;
      
      this.currentAudio.onended = () => {
        this.isPlaying = false;
        URL.revokeObjectURL(audioUrl);
        this.currentAudio = null;
        onEnd?.();
        resolve();
      };

      this.currentAudio.onerror = (e) => {
        console.error('❌ Audio playback error:', e);
        this.isPlaying = false;
        URL.revokeObjectURL(audioUrl);
        this.currentAudio = null;
        // Fall back to Web Speech
        this.fallbackSpeak(blob.toString(), onEnd).then(resolve);
      };

      this.currentAudio.play().catch((e) => {
        console.error('❌ Audio play() failed:', e);
        this.fallbackSpeak('', onEnd).then(resolve);
      });
    });
  }

  // Fallback to Web Speech API
  private fallbackSpeak(text: string, onEnd?: () => void): Promise<void> {
    return new Promise((resolve) => {
      console.log('🔈 Using Web Speech API fallback');
      const synthesis = window.speechSynthesis;
      synthesis.cancel();

      if (!text || text.trim().length === 0) {
        onEnd?.();
        resolve();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      // Try to get a good English voice
      const loadVoices = () => {
        const voices = synthesis.getVoices();
        const preferredVoice = voices.find(v => 
          v.name.includes('Google') || 
          v.name.includes('Microsoft') || 
          v.name.includes('Natural') || 
          (v.lang.startsWith('en') && v.localService)
        ) || voices.find(v => v.lang.startsWith('en'));
        
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
      };

      // Voices may not be loaded yet
      if (synthesis.getVoices().length > 0) {
        loadVoices();
      } else {
        synthesis.onvoiceschanged = loadVoices;
        // Fallback timeout
        setTimeout(loadVoices, 100);
      }
    });
  }

  stop(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
    this.isPlaying = false;
    
    // Also stop any fallback speech
    window.speechSynthesis?.cancel();
  }

  isSpeaking(): boolean {
    return this.isPlaying || (this.currentAudio?.paused === false) || window.speechSynthesis?.speaking;
  }

  isConfigured(): boolean {
    return !!ELEVENLABS_API_KEY && ELEVENLABS_API_KEY.length > 10;
  }
}

export const elevenLabsService = new ElevenLabsService();
