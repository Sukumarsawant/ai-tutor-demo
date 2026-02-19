# AI Tutor - Interactive Learning Assistant

An interactive real-time AI tutor that explains concepts through visual drawings and clear explanations.

##  Features

- **Interactive Canvas** (left): tldraw-powered whiteboard where AI draws visualizations
- **Chat Interface** (right): Text/voice input to ask questions
- **Real-time Drawing**: AI draws diagrams step-by-step while explaining
- **Voice I/O**: Speak your questions, hear explanations (Web Speech API - free!)
- **100% Free Stack**: Uses Groq's free tier for AI

##  Quick Start

### 1. Get a Free API Key

1. Go to https://console.groq.com
2. Sign up (free)
3. Create an API key

### 2. Configure the Project

Copy `.env.example` to `.env` and add your Groq API key:
```
VITE_GROQ_API_KEY=your_key_here
```

### 3. Install & Run

```bash
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

##  How to Use

1. Type or speak a question like:
   - "Explain Newton's Laws of Motion"
   - "What is photosynthesis?"
   - "How does gravity work?"

2. Watch the AI draw diagrams and explain concepts!

##  Tech Stack (All Free!)

- **Canvas**: tldraw (MIT)
- **AI Model**: Groq (Llama 3.3 70B) - Free tier
- **Speech**: Web Speech API (browser-native, free)
- **Frontend**: React + Vite + TypeScript

Built with  for education
