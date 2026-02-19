import OpenAI from 'openai';
import Groq from 'groq-sdk';
import type { AIResponse } from '../types';

// Initialize OpenAI client (primary)
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
  dangerouslyAllowBrowser: true
});

// Initialize Groq client (fallback)
const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY || '',
  dangerouslyAllowBrowser: true
});

// Track current topic for smart context
let currentTopic: string | null = null;

const SYSTEM_PROMPT = `You are Feynman, an expert AI tutor. Explain concepts with visual diagrams.

RESPOND WITH ONLY A JSON OBJECT (no markdown):

{
  "topic": "topic name",
  "isNewTopic": true or false,
  "taskBreakdown": ["Step 1: ...", "Step 2: ...", "Step 3: ..."],
  "explanation": "Detailed explanation with **bold** headers for each step",
  "narration": "Short 2-3 sentence summary for speech",
  "drawCommands": [
    {"type": "text", "x": 350, "y": 40, "props": {"text": "Title", "color": "black"}},
    {"type": "circle", "x": 200, "y": 150, "props": {"radius": 45, "color": "blue"}},
    {"type": "text", "x": 170, "y": 210, "props": {"text": "Label", "color": "blue"}},
    {"type": "arrow", "x": 0, "y": 0, "props": {"start": {"x": 250, "y": 150}, "end": {"x": 350, "y": 150}, "color": "black"}}
  ]
}

DRAWING RULES:
- Canvas: 800x600 pixels
- Use zones: TOP (y:30-80), UPPER (y:100-200), MIDDLE (y:220-350), LOWER (y:370-450)
- Horizontal: LEFT (x:80-250), CENTER (x:300-500), RIGHT (x:550-750)
- Circle radius: 35-50, Rectangle: 100x70
- Minimum 80px between elements
- Colors: blue (main), green (input), red (output), orange (process), black (text), violet (special)
- Always add text labels below shapes
- Use arrows to show flow/relationships

Set isNewTopic:true for new subjects, false for follow-ups.`;

export async function getAIResponse(
  userMessage: string,
  conversationHistory: { role: 'user' | 'assistant'; content: string }[]
): Promise<AIResponse & { isNewTopic?: boolean; taskBreakdown?: string[] }> {
  const contextMessage = currentTopic 
    ? `Continue explaining "${currentTopic}". Set isNewTopic:false.`
    : 'New topic. Set isNewTopic:true.';

  const messagesForOpenAI = [
    { role: 'system' as const, content: SYSTEM_PROMPT },
    { role: 'system' as const, content: contextMessage },
    ...conversationHistory.slice(-4).map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content
    })),
    { role: 'user' as const, content: userMessage }
  ];

  // Try OpenAI first
  try {
    console.log('Trying OpenAI...');
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: messagesForOpenAI,
      temperature: 0.7,
      max_tokens: 2500,
      response_format: { type: "json_object" }
    });

    const responseText = completion.choices[0]?.message?.content || '';
    console.log('OpenAI succeeded');
    return parseAIResponse(responseText);
  } catch (openaiError) {
    console.log('OpenAI failed:', openaiError);
  }

  // Fallback to Groq
  try {
    console.log('Trying Groq fallback...');
    const messagesForGroq = [
      { role: 'system' as const, content: SYSTEM_PROMPT + '\n\nIMPORTANT: Respond with ONLY valid JSON, no markdown.' },
      { role: 'system' as const, content: contextMessage },
      ...conversationHistory.slice(-4).map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content
      })),
      { role: 'user' as const, content: userMessage }
    ];

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: messagesForGroq,
      temperature: 0.7,
      max_tokens: 2500
    });

    let responseText = completion.choices[0]?.message?.content || '';
    
    // Clean Groq response (may have markdown)
    responseText = responseText.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    console.log('Groq succeeded');
    return parseAIResponse(responseText);
  } catch (groqError) {
    console.log('Groq also failed:', groqError);
    throw new Error('Both OpenAI and Groq failed. Please check your API keys.');
  }
}

function parseAIResponse(responseText: string): AIResponse & { isNewTopic?: boolean; taskBreakdown?: string[] } {
  try {
    const parsed = JSON.parse(responseText);
    
    if (parsed.topic && parsed.isNewTopic) {
      currentTopic = parsed.topic;
    }
    
    return {
      explanation: parsed.explanation || 'No explanation provided.',
      drawCommands: parsed.drawCommands || [],
      narration: parsed.narration || parsed.explanation,
      isNewTopic: parsed.isNewTopic ?? true,
      taskBreakdown: parsed.taskBreakdown || []
    };
  } catch {
    return {
      explanation: responseText,
      narration: responseText,
      isNewTopic: true,
      taskBreakdown: []
    };
  }
}

// Mermaid diagram generation prompt
const MERMAID_SYSTEM_PROMPT = `You are Feynman, an expert AI tutor. Generate clear Mermaid diagrams.

RESPOND WITH ONLY A JSON OBJECT (no markdown):

{
  "topic": "topic name",
  "isNewTopic": true or false,
  "explanation": "Detailed text explanation",
  "mermaidCode": "graph TD\\n    A[Start] --> B[End]"
}

CRITICAL MERMAID SYNTAX RULES (MUST FOLLOW):

1. ALWAYS quote node text with special characters:
   - BAD: A[O(n^2)] - WILL ERROR
   - GOOD: A["O(n²)"] - Works!
   - BAD: B[O(2^n)]  
   - GOOD: B["O(2ⁿ)"]
   - Use Unicode superscripts: ² ³ ⁿ instead of ^

2. NEVER use these characters unquoted: ^ ( ) < > { } | # &
   - Always wrap in double quotes: A["text with (parens)"]

3. SIMPLE NODE IDs:
   - Use short IDs: A, B, C, N1, N2
   - Text goes in brackets: A["Complex Text Here"]

4. FLOWCHART FORMAT:
   graph TD
       A["First Node"] --> B["Second Node"]
       B --> C["Third Node"]

5. SUBGRAPHS (for grouping):
   graph TD
       subgraph Group1["Input Layer"]
           A["Node A"]
           B["Node B"]
       end
       subgraph Group2["Output Layer"]
           C["Node C"]
       end
       A --> C
       B --> C

6. NO INVISIBLE EDGES (~~~) - they cause errors. Use regular arrows or omit.

7. KEEP IT SIMPLE:
   - Max 10-12 nodes
   - Short text labels (2-4 words)
   - Use --> for all connections

EXAMPLE - Time Complexity:
graph TD
    A["Time Complexity"] --> B["Big O Notation"]
    B --> C["O(1) Constant"]
    B --> D["O(n) Linear"]
    B --> E["O(n²) Quadratic"]
    B --> F["O(log n) Logarithmic"]

EXAMPLE - Computer System:
graph TD
    subgraph Hardware
        A["CPU"] --> B["RAM"]
        B --> C["Storage"]
    end
    subgraph Software
        D["OS"] --> E["Apps"]
    end
    A --> D`;

export interface MermaidResponse {
  topic: string;
  isNewTopic: boolean;
  explanation: string;
  mermaidCode: string;
}

export async function getMermaidResponse(
  userMessage: string,
  conversationHistory: { role: 'user' | 'assistant'; content: string }[]
): Promise<MermaidResponse> {
  const contextMessage = currentTopic 
    ? `Continue explaining "${currentTopic}". Set isNewTopic:false.`
    : 'New topic. Set isNewTopic:true.';

  const messages = [
    { role: 'system' as const, content: MERMAID_SYSTEM_PROMPT },
    { role: 'system' as const, content: contextMessage },
    ...conversationHistory.slice(-4).map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content
    })),
    { role: 'user' as const, content: userMessage }
  ];

  // Try OpenAI first
  try {
    console.log('Trying OpenAI for Mermaid...');
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.7,
      max_tokens: 2500,
      response_format: { type: "json_object" }
    });

    const responseText = completion.choices[0]?.message?.content || '';
    console.log('OpenAI Mermaid succeeded');
    return parseMermaidResponse(responseText);
  } catch (openaiError) {
    console.log('OpenAI failed:', openaiError);
  }

  // Fallback to Groq
  try {
    console.log('Trying Groq fallback for Mermaid...');
    const groqMessages = [
      { role: 'system' as const, content: MERMAID_SYSTEM_PROMPT + '\n\nIMPORTANT: Respond with ONLY valid JSON, no markdown wrapping.' },
      { role: 'system' as const, content: contextMessage },
      ...conversationHistory.slice(-4).map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content
      })),
      { role: 'user' as const, content: userMessage }
    ];

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: groqMessages,
      temperature: 0.7,
      max_tokens: 2500
    });

    let responseText = completion.choices[0]?.message?.content || '';
    responseText = responseText.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    console.log('Groq Mermaid succeeded');
    return parseMermaidResponse(responseText);
  } catch (groqError) {
    console.log('Groq also failed:', groqError);
    throw new Error('Both OpenAI and Groq failed. Please check your API keys.');
  }
}

function parseMermaidResponse(responseText: string): MermaidResponse {
  try {
    const parsed = JSON.parse(responseText);
    
    if (parsed.topic && parsed.isNewTopic) {
      currentTopic = parsed.topic;
    }
    
    // Clean up mermaid code
    let mermaidCode = parsed.mermaidCode || '';
    mermaidCode = mermaidCode.replace(/\\n/g, '\n');
    
    // Sanitize mermaid code to fix common issues
    mermaidCode = sanitizeMermaidCode(mermaidCode);
    
    return {
      topic: parsed.topic || 'Concept',
      isNewTopic: parsed.isNewTopic ?? true,
      explanation: parsed.explanation || 'No explanation provided.',
      mermaidCode
    };
  } catch {
    return {
      topic: 'Response',
      isNewTopic: true,
      explanation: responseText,
      mermaidCode: ''
    };
  }
}

// Sanitize mermaid code to fix common syntax errors
function sanitizeMermaidCode(code: string): string {
  // Remove invisible edges (~~~) which often cause errors
  code = code.replace(/\s*~~~\s*/g, '\n    ');
  
  // Fix unquoted special characters in node text
  // Match node definitions like A[text] and quote if needed
  code = code.replace(/(\w+)\[([^\]"]+)\]/g, (match, id, text) => {
    // If text contains special chars, wrap in quotes
    if (/[()^<>|&#]/.test(text)) {
      // Replace ^ with unicode superscript
      text = text.replace(/\^2/g, '²').replace(/\^3/g, '³').replace(/\^n/g, 'ⁿ');
      return `${id}["${text}"]`;
    }
    return match;
  });
  
  // Fix subgraph names that might have issues
  code = code.replace(/subgraph\s+([^\["\n]+)\n/g, (match, name) => {
    const trimmed = name.trim();
    if (/[()^<>|&#\s]/.test(trimmed) && !trimmed.startsWith('"')) {
      return `subgraph "${trimmed}"\n`;
    }
    return match;
  });
  
  return code;
}

export function isAPIKeyConfigured(): boolean {
  return !!(import.meta.env.VITE_OPENAI_API_KEY || import.meta.env.VITE_GROQ_API_KEY);
}

export function resetTopicContext(): void {
  currentTopic = null;
}

export function getCurrentTopic(): string | null {
  return currentTopic;
}
