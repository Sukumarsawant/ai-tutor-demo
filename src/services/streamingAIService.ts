// Streaming AI Service - Sends diagram parts progressively for coordinated drawing/speaking
// Uses smart layout engine for auto-positioning

import OpenAI from 'openai';
import Groq from 'groq-sdk';
import { 
  generateDiagramCommands, 
  toDrawCommands,
  type DiagramSpec,
  type DiagramNode,
  type DiagramConnection,
  type LayoutType,
} from './smartLayoutEngine';
import type { DrawCommand } from '../types';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
  dangerouslyAllowBrowser: true
});

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY || '',
  dangerouslyAllowBrowser: true
});

// Types for streaming responses
export interface StreamingPart {
  type: 'intro' | 'node' | 'connection' | 'conclusion';
  narration: string;
  drawCommands: DrawCommand[];
  nodeInfo?: {
    id: string;
    label: string;
    nodeType?: string;
  };
}

export interface StreamingDiagramResponse {
  topic: string;
  layout: LayoutType;
  parts: StreamingPart[];
  fullExplanation: string;
  taskBreakdown: string[];
  isNewTopic: boolean;
}

// Simpler prompt that works with both APIs
const STREAMING_PROMPT = `You are an AI tutor. Explain concepts with step-by-step diagrams.

RESPOND WITH JSON ONLY:
{
  "topic": "the topic name",
  "isNewTopic": true or false,
  "layout": "flow" or "tree" or "radial" or "mindmap" or "timeline",
  "taskBreakdown": ["Step 1: ...", "Step 2: ...", "Step 3: ..."],
  "fullExplanation": "Complete explanation with **bold** for emphasis",
  "nodes": [
    {"id": "1", "label": "Main Topic", "type": "rectangle", "parent": null},
    {"id": "2", "label": "Subtopic A", "type": "circle", "parent": "1"},
    {"id": "3", "label": "Subtopic B", "type": "diamond", "parent": "1"}
  ],
  "connections": [
    {"from": "1", "to": "2", "label": "leads to"},
    {"from": "1", "to": "3"}
  ],
  "narrationParts": [
    "Let me explain the main concept...",
    "First, we have...",
    "This connects to..."
  ]
}

LAYOUT GUIDE (pick the best fit):
- "flow": Sequential steps (processes, tutorials)
- "tree": Hierarchical structures (organizations, categories)
- "mindmap": Central concept with branches (brainstorming)
- "radial": Equal items around center (comparisons)
- "timeline": Time-based sequences (history, schedules)

NODE TYPES: rectangle, circle, diamond, hexagon, ellipse
- rectangle: Main concepts, titles, processes
- circle: Points, steps, items
- diamond: Decisions, conditions
- hexagon: Special states, unique items
- ellipse: Soft concepts, outcomes

Keep nodes to 4-8 for clarity. Use parent field for hierarchy.`;

// Parse and convert AI response to streaming parts
function parseToStreamingParts(responseText: string): StreamingDiagramResponse {
  const parsed = JSON.parse(responseText);
  
  // Convert to DiagramNode format (uses 'type' for category, not shape)
  const nodes: DiagramNode[] = (parsed.nodes || []).map((n: any) => ({
    id: n.id,
    label: n.label,
    type: mapNodeType(n.type), // Map to diagram category
    shape: mapToShape(n.type), // Map to actual shape
  }));

  const connections: DiagramConnection[] = (parsed.connections || []).map((c: any) => ({
    from: c.from,
    to: c.to,
    label: c.label,
  }));

  const layout = (parsed.layout || 'flow') as LayoutType;
  
  // Create diagram spec
  const diagramSpec: DiagramSpec = {
    title: parsed.topic,
    layout,
    nodes,
    connections,
  };

  // Generate positioned elements and convert to draw commands
  const positionedElements = generateDiagramCommands(diagramSpec);
  const allDrawCommands = toDrawCommands(positionedElements) as DrawCommand[];
  
  // Split into parts with narration
  const parts: StreamingPart[] = [];
  const narrations = parsed.narrationParts || [parsed.fullExplanation];
  
  // Part 1: Introduction with title
  const titleCommands = allDrawCommands.filter((cmd: DrawCommand) => 
    cmd.type === 'text' && cmd.props?.text === parsed.topic
  );
  if (titleCommands.length > 0) {
    parts.push({
      type: 'intro',
      narration: narrations[0] || `Let me explain ${parsed.topic}.`,
      drawCommands: titleCommands,
    });
  }

  // Subsequent parts: One per node
  const nodeCommands = new Map<string, DrawCommand[]>();
  
  // Group commands by node (shape + label)
  nodes.forEach((node, index) => {
    const commands = allDrawCommands.filter((cmd: DrawCommand) => {
      // Match shapes at node position or text containing node label
      if (cmd.type === 'text' && cmd.props?.text === node.label) return true;
      if (cmd.type !== 'text' && cmd.type !== 'arrow') {
        // Check if this is the shape for this node by index matching
        const nodeShapes = allDrawCommands.filter((c: DrawCommand) => 
          c.type !== 'text' && c.type !== 'arrow'
        );
        return nodeShapes.indexOf(cmd) === index;
      }
      return false;
    });
    if (commands.length) nodeCommands.set(node.id, commands);
  });

  // Add node parts
  nodes.forEach((node, index) => {
    const commands = nodeCommands.get(node.id) || [];
    const narration = narrations[index + 1] || `This shows ${node.label}.`;
    
    parts.push({
      type: 'node',
      narration,
      drawCommands: commands,
      nodeInfo: {
        id: node.id,
        label: node.label,
        nodeType: node.type,
      },
    });
  });

  // Add connections as final part
  const arrowCommands = allDrawCommands.filter((cmd: DrawCommand) => cmd.type === 'arrow');
  if (arrowCommands.length > 0) {
    parts.push({
      type: 'connection',
      narration: narrations[narrations.length - 1] || 'And here are the connections between these concepts.',
      drawCommands: arrowCommands,
    });
  }

  return {
    topic: parsed.topic || 'Concept',
    layout: layout,
    parts,
    fullExplanation: parsed.fullExplanation || '',
    taskBreakdown: parsed.taskBreakdown || [],
    isNewTopic: parsed.isNewTopic ?? true,
  };
}

// Map node type string to diagram category
function mapNodeType(type?: string): DiagramNode['type'] {
  const typeMap: Record<string, DiagramNode['type']> = {
    'rectangle': 'primary',
    'circle': 'secondary',
    'diamond': 'decision',
    'hexagon': 'process',
    'ellipse': 'tertiary',
    'primary': 'primary',
    'secondary': 'secondary',
    'tertiary': 'tertiary',
    'input': 'input',
    'output': 'output',
    'process': 'process',
    'decision': 'decision',
    'data': 'data',
  };
  return typeMap[type || 'primary'] || 'primary';
}

// Map to actual shape type
function mapToShape(type?: string): 'rectangle' | 'circle' | 'diamond' | 'hexagon' | 'pill' | 'cloud' | 'star' | undefined {
  const shapeMap: Record<string, 'rectangle' | 'circle' | 'diamond' | 'hexagon' | 'pill'> = {
    'rectangle': 'rectangle',
    'circle': 'circle',
    'diamond': 'diamond',
    'hexagon': 'hexagon',
    'ellipse': 'pill',
    'primary': 'rectangle',
    'secondary': 'pill',
    'tertiary': 'circle',
    'decision': 'diamond',
    'process': 'rectangle',
    'input': 'hexagon',
    'output': 'hexagon',
    'data': 'rectangle',
  };
  return shapeMap[type || 'rectangle'];
}

// Main streaming function - with callback for each part
export async function getStreamingAIResponse(
  userMessage: string,
  conversationHistory: { role: 'user' | 'assistant'; content: string }[],
  onPart?: (part: StreamingPart, partIndex: number, totalParts: number) => Promise<void>
): Promise<StreamingDiagramResponse> {
  
  const messages = [
    { role: 'system' as const, content: STREAMING_PROMPT },
    ...conversationHistory.slice(-4).map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content
    })),
    { role: 'user' as const, content: userMessage }
  ];

  let responseText = '';

  // Try OpenAI first
  try {
    console.log('Streaming: Trying OpenAI...');
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.7,
      max_tokens: 2000,
      response_format: { type: "json_object" }
    });
    responseText = completion.choices[0]?.message?.content || '';
    console.log('Streaming: OpenAI succeeded');
  } catch (error) {
    console.log('Streaming: OpenAI failed, trying Groq...');
    
    try {
      const completion = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { 
            role: 'system' as const, 
            content: STREAMING_PROMPT + '\n\nRESPOND WITH VALID JSON ONLY.' 
          },
          ...messages.slice(1)
        ],
        temperature: 0.7,
        max_tokens: 2000
      });
      responseText = completion.choices[0]?.message?.content || '';
      responseText = responseText.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
      console.log('Streaming: Groq succeeded');
    } catch (groqError) {
      console.error('Both APIs failed:', error, groqError);
      throw new Error('Failed to get AI response');
    }
  }

  // Parse response into streaming parts
  const response = parseToStreamingParts(responseText);

  // Execute parts with callbacks
  if (onPart) {
    for (let i = 0; i < response.parts.length; i++) {
      await onPart(response.parts[i], i, response.parts.length);
    }
  }

  return response;
}

// Simpler non-streaming version that still uses smart layout
export async function getSmartLayoutResponse(
  userMessage: string,
  conversationHistory: { role: 'user' | 'assistant'; content: string }[]
): Promise<{
  explanation: string;
  narration: string;
  drawCommands: DrawCommand[];
  taskBreakdown: string[];
  isNewTopic: boolean;
}> {
  const response = await getStreamingAIResponse(userMessage, conversationHistory);
  
  // Combine all parts
  const allCommands: DrawCommand[] = [];
  response.parts.forEach(part => {
    allCommands.push(...part.drawCommands);
  });

  const allNarrations = response.parts.map(p => p.narration).join(' ');

  return {
    explanation: response.fullExplanation,
    narration: allNarrations,
    drawCommands: allCommands,
    taskBreakdown: response.taskBreakdown,
    isNewTopic: response.isNewTopic,
  };
}

// Create streaming parts from pre-generated content
export function createStreamingPartsFromSimple(
  topic: string,
  nodes: Array<{ id: string; label: string; type?: string; parent?: string }>,
  connections: Array<{ from: string; to: string; label?: string }>,
  narrations: string[],
  layout: LayoutType = 'flow'
): StreamingPart[] {
  const diagramNodes: DiagramNode[] = nodes.map(n => ({
    id: n.id,
    label: n.label,
    type: mapNodeType(n.type),
    shape: mapToShape(n.type),
  }));

  const diagramSpec: DiagramSpec = {
    title: topic,
    layout,
    nodes: diagramNodes,
    connections,
  };

  const positionedElements = generateDiagramCommands(diagramSpec);
  const allCommands = toDrawCommands(positionedElements) as DrawCommand[];
  
  // Similar splitting logic
  const parts: StreamingPart[] = [];
  
  // Title part
  const titleCmd = allCommands.find((cmd: DrawCommand) => 
    cmd.type === 'text' && cmd.props?.text === topic
  );
  if (titleCmd) {
    parts.push({
      type: 'intro',
      narration: narrations[0] || `Let's explore ${topic}.`,
      drawCommands: [titleCmd],
    });
  }

  // Node parts
  nodes.forEach((node, index) => {
    const shapeCommands = allCommands.filter((cmd: DrawCommand) => 
      cmd.type === 'text' && cmd.props?.text === node.label
    );
    const shapes = allCommands.filter((cmd: DrawCommand) => 
      cmd.type !== 'text' && cmd.type !== 'arrow'
    );
    const nodeShape = shapes[index];
    
    const cmds: DrawCommand[] = nodeShape ? [nodeShape, ...shapeCommands] : shapeCommands;
    
    parts.push({
      type: 'node',
      narration: narrations[index + 1] || `Here we have ${node.label}.`,
      drawCommands: cmds,
      nodeInfo: {
        id: node.id,
        label: node.label,
        nodeType: node.type,
      },
    });
  });

  // Connection part
  const arrows = allCommands.filter((cmd: DrawCommand) => cmd.type === 'arrow');
  if (arrows.length > 0) {
    parts.push({
      type: 'connection',
      narration: narrations[narrations.length - 1] || 'These elements are connected.',
      drawCommands: arrows,
    });
  }

  return parts;
}
