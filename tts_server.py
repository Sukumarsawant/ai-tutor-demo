"""
Python TTS Backend - Alternative to browser-based ElevenLabs calls
Run this server to get more reliable TTS without CORS issues

Usage:
  1. Install: pip install flask flask-cors elevenlabs
  2. Run: python tts_server.py
  3. Update frontend to call http://localhost:5000/tts
"""

from flask import Flask, request, Response, jsonify
from flask_cors import CORS
import os
import io

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend calls

# Load API key from environment or .env file
ELEVENLABS_API_KEY = os.environ.get('VITE_ELEVENLABS_API_KEY', '')

# Try to load from .env file if not in environment
if not ELEVENLABS_API_KEY:
    try:
        with open('.env', 'r') as f:
            for line in f:
                if line.startswith('VITE_ELEVENLABS_API_KEY='):
                    ELEVENLABS_API_KEY = line.split('=', 1)[1].strip()
                    break
    except FileNotFoundError:
        pass

print(f"ElevenLabs API Key configured: {bool(ELEVENLABS_API_KEY)}")

# Voice IDs
VOICES = {
    'rachel': '21m00Tcm4TlvDq8ikWAM',
    'adam': 'pNInz6obpgDQGcFmaJgB',
    'josh': 'TxGEqnHWrfWFTfGW9XjX',
    'bella': 'EXAVITQu4vr4xnSDxMaL',
}

@app.route('/tts', methods=['POST'])
def text_to_speech():
    """Convert text to speech using ElevenLabs"""
    
    data = request.json
    text = data.get('text', '')
    voice = data.get('voice', 'rachel')
    
    if not text:
        return jsonify({'error': 'No text provided'}), 400
    
    if not ELEVENLABS_API_KEY:
        return jsonify({'error': 'ElevenLabs API key not configured'}), 500
    
    voice_id = VOICES.get(voice, VOICES['rachel'])
    
    try:
        import requests
        
        response = requests.post(
            f'https://api.elevenlabs.io/v1/text-to-speech/{voice_id}',
            headers={
                'Accept': 'audio/mpeg',
                'Content-Type': 'application/json',
                'xi-api-key': ELEVENLABS_API_KEY,
            },
            json={
                'text': text[:1000],  # Limit text length
                'model_id': 'eleven_monolingual_v1',
                'voice_settings': {
                    'stability': 0.5,
                    'similarity_boost': 0.75,
                }
            },
            timeout=30
        )
        
        if response.status_code != 200:
            return jsonify({'error': f'ElevenLabs error: {response.status_code}'}), 500
        
        return Response(
            response.content,
            mimetype='audio/mpeg',
            headers={'Content-Disposition': 'inline'}
        )
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/tts/sarvam', methods=['POST'])
def sarvam_tts():
    """Text to speech using Sarvam AI (Indian voices)"""
    
    SARVAM_API_KEY = os.environ.get('VITE_SARVAM_API_KEY', '')
    
    # Try to load from .env
    if not SARVAM_API_KEY:
        try:
            with open('.env', 'r') as f:
                for line in f:
                    if line.startswith('VITE_SARVAM_API_KEY='):
                        SARVAM_API_KEY = line.split('=', 1)[1].strip()
                        break
        except FileNotFoundError:
            pass
    
    if not SARVAM_API_KEY:
        return jsonify({'error': 'Sarvam API key not configured'}), 500
    
    data = request.json
    text = data.get('text', '')
    language = data.get('language', 'en-IN')
    
    if not text:
        return jsonify({'error': 'No text provided'}), 400
    
    try:
        import requests
        
        response = requests.post(
            'https://api.sarvam.ai/text-to-speech',
            headers={
                'Content-Type': 'application/json',
                'API-Subscription-Key': SARVAM_API_KEY,
            },
            json={
                'text': text[:500],
                'target_language_code': language,
                'speaker': 'meera',  # Options: meera, arvind
                'pitch': 0,
                'pace': 1.0,
                'loudness': 1.0,
            },
            timeout=30
        )
        
        if response.status_code != 200:
            return jsonify({'error': f'Sarvam error: {response.status_code}'}), 500
        
        # Sarvam returns base64 audio
        audio_data = response.json().get('audios', [{}])[0]
        if audio_data:
            import base64
            audio_bytes = base64.b64decode(audio_data)
            return Response(audio_bytes, mimetype='audio/wav')
        
        return jsonify({'error': 'No audio returned'}), 500
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'ok',
        'elevenlabs_configured': bool(ELEVENLABS_API_KEY),
    })


if __name__ == '__main__':
    print("🎤 TTS Server starting on http://localhost:5000")
    print("   POST /tts - ElevenLabs TTS")
    print("   POST /tts/sarvam - Sarvam AI TTS")
    print("   GET /health - Health check")
    app.run(port=5000, debug=True)
