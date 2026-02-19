// Pre-generated responses for instant demos - no API call needed
// Each step has narration synced with its draw commands
// IMPROVED: Better spacing to prevent overlap (100px+ gaps)

import type { DrawCommand } from '../types';

export interface TeachingStep {
  narration: string;
  drawCommands: DrawCommand[];
}

export interface PreGeneratedTopic {
  keywords: string[];
  topic: string;
  taskBreakdown: string[];
  explanation: string;
  steps: TeachingStep[];
}

export const preGeneratedTopics: PreGeneratedTopic[] = [
  // ============ NEWTON'S LAWS OF MOTION ============
  {
    keywords: ['newton', 'laws', 'motion', 'force', 'inertia'],
    topic: 'newtons-laws',
    taskBreakdown: [
      'Step 1: First Law - Law of Inertia',
      'Step 2: Second Law - F = ma',
      'Step 3: Third Law - Action-Reaction'
    ],
    explanation: `Newton's Three Laws of Motion

First Law (Inertia): An object at rest stays at rest. An object in motion stays in motion unless a force acts on it.

Second Law (F = ma): Force equals mass times acceleration. Heavier objects need more force.

Third Law (Action-Reaction): Every action has an equal and opposite reaction.`,
    steps: [
      {
        narration: "Let me explain Newton's three laws of motion with diagrams.",
        drawCommands: [
          { type: 'text', x: 280, y: 25, props: { text: "NEWTON'S LAWS", color: 'black' } }
        ]
      },
      {
        narration: "First Law: An object at rest stays at rest. Here's a ball sitting still on the ground.",
        drawCommands: [
          { type: 'text', x: 50, y: 70, props: { text: 'LAW 1: INERTIA', color: 'blue' } },
          { type: 'circle', x: 120, y: 140, props: { radius: 25, color: 'blue' } },
          { type: 'text', x: 90, y: 185, props: { text: 'At Rest', color: 'blue' } }
        ]
      },
      {
        narration: "Apply a force, and the ball moves. It keeps moving until another force stops it.",
        drawCommands: [
          { type: 'arrow', x: 0, y: 0, props: { start: { x: 160, y: 140 }, end: { x: 230, y: 140 }, color: 'green' } },
          { type: 'circle', x: 280, y: 140, props: { radius: 25, color: 'green' } },
          { type: 'text', x: 245, y: 185, props: { text: 'Moving', color: 'green' } }
        ]
      },
      {
        narration: "Second Law: Force equals mass times acceleration. F equals m times a.",
        drawCommands: [
          { type: 'text', x: 400, y: 70, props: { text: 'LAW 2: F = ma', color: 'orange' } },
          { type: 'rectangle', x: 400, y: 110, props: { w: 80, h: 50, color: 'orange' } },
          { type: 'text', x: 415, y: 180, props: { text: 'Mass', color: 'orange' } }
        ]
      },
      {
        narration: "More mass needs more force to accelerate. Push harder for heavier objects.",
        drawCommands: [
          { type: 'arrow', x: 0, y: 0, props: { start: { x: 490, y: 135 }, end: { x: 570, y: 135 }, color: 'red' } },
          { type: 'text', x: 510, y: 115, props: { text: 'Force', color: 'red' } },
          { type: 'text', x: 580, y: 135, props: { text: 'a', color: 'red' } }
        ]
      },
      {
        narration: "Third Law: Every action has an equal and opposite reaction.",
        drawCommands: [
          { type: 'text', x: 50, y: 250, props: { text: 'LAW 3: ACTION-REACTION', color: 'violet' } },
          { type: 'rectangle', x: 80, y: 300, props: { w: 60, h: 50, color: 'violet' } },
          { type: 'text', x: 85, y: 370, props: { text: 'Hand', color: 'violet' } }
        ]
      },
      {
        narration: "When you push a wall, the wall pushes back with equal force.",
        drawCommands: [
          { type: 'arrow', x: 0, y: 0, props: { start: { x: 150, y: 320 }, end: { x: 220, y: 320 }, color: 'green' } },
          { type: 'rectangle', x: 230, y: 280, props: { w: 25, h: 90, color: 'grey' } },
          { type: 'arrow', x: 0, y: 0, props: { start: { x: 220, y: 340 }, end: { x: 150, y: 340 }, color: 'red' } },
          { type: 'text', x: 265, y: 320, props: { text: 'Wall', color: 'grey' } }
        ]
      }
    ]
  },

  // ============ COMPUTER SYSTEM ============
  {
    keywords: ['computer', 'system', 'cpu', 'memory', 'hardware', 'architecture'],
    topic: 'computer-system',
    taskBreakdown: [
      'Step 1: Input Devices',
      'Step 2: CPU Processing',
      'Step 3: Memory and Storage',
      'Step 4: Output Devices'
    ],
    explanation: `Computer System Architecture

Input: Keyboard, mouse send data into the computer.

CPU: The brain that processes all instructions.

Memory: RAM for fast temporary storage, hard drive for permanent storage.

Output: Monitor and speakers display results.`,
    steps: [
      {
        narration: "Let me show you how a computer system works. Data flows from input to output.",
        drawCommands: [
          { type: 'text', x: 250, y: 25, props: { text: 'COMPUTER SYSTEM', color: 'black' } }
        ]
      },
      {
        narration: "First, input devices. Keyboard and mouse send your commands into the computer.",
        drawCommands: [
          { type: 'text', x: 30, y: 70, props: { text: 'INPUT', color: 'green' } },
          { type: 'rectangle', x: 30, y: 100, props: { w: 90, h: 45, color: 'green' } },
          { type: 'text', x: 40, y: 165, props: { text: 'Keyboard', color: 'green' } },
          { type: 'rectangle', x: 30, y: 200, props: { w: 90, h: 45, color: 'green' } },
          { type: 'text', x: 50, y: 265, props: { text: 'Mouse', color: 'green' } }
        ]
      },
      {
        narration: "Data flows from input to the CPU through these connections.",
        drawCommands: [
          { type: 'arrow', x: 0, y: 0, props: { start: { x: 130, y: 120 }, end: { x: 200, y: 160 }, color: 'green' } },
          { type: 'arrow', x: 0, y: 0, props: { start: { x: 130, y: 220 }, end: { x: 200, y: 180 }, color: 'green' } }
        ]
      },
      {
        narration: "The CPU is the brain. It processes all instructions and calculations.",
        drawCommands: [
          { type: 'rectangle', x: 210, y: 120, props: { w: 120, h: 80, color: 'blue' } },
          { type: 'text', x: 250, y: 155, props: { text: 'CPU', color: 'black' } },
          { type: 'text', x: 235, y: 220, props: { text: 'Processor', color: 'blue' } }
        ]
      },
      {
        narration: "Memory works with the CPU. RAM is fast temporary storage.",
        drawCommands: [
          { type: 'rectangle', x: 210, y: 280, props: { w: 120, h: 50, color: 'orange' } },
          { type: 'text', x: 250, y: 300, props: { text: 'RAM', color: 'black' } },
          { type: 'arrow', x: 0, y: 0, props: { start: { x: 270, y: 210 }, end: { x: 270, y: 270 }, color: 'orange' } }
        ]
      },
      {
        narration: "Storage keeps data permanently. Your files stay even when power is off.",
        drawCommands: [
          { type: 'rectangle', x: 210, y: 360, props: { w: 120, h: 50, color: 'grey' } },
          { type: 'text', x: 230, y: 380, props: { text: 'Storage', color: 'black' } },
          { type: 'arrow', x: 0, y: 0, props: { start: { x: 270, y: 340 }, end: { x: 270, y: 355 }, color: 'grey' } }
        ]
      },
      {
        narration: "Finally, output devices show you the results. Monitor displays, speakers play sound.",
        drawCommands: [
          { type: 'arrow', x: 0, y: 0, props: { start: { x: 340, y: 150 }, end: { x: 420, y: 120 }, color: 'red' } },
          { type: 'arrow', x: 0, y: 0, props: { start: { x: 340, y: 170 }, end: { x: 420, y: 220 }, color: 'red' } },
          { type: 'text', x: 430, y: 70, props: { text: 'OUTPUT', color: 'red' } },
          { type: 'rectangle', x: 430, y: 100, props: { w: 90, h: 45, color: 'red' } },
          { type: 'text', x: 445, y: 165, props: { text: 'Monitor', color: 'red' } },
          { type: 'rectangle', x: 430, y: 200, props: { w: 90, h: 45, color: 'red' } },
          { type: 'text', x: 440, y: 265, props: { text: 'Speakers', color: 'red' } }
        ]
      }
    ]
  },

  // ============ TIME COMPLEXITY ============
  {
    keywords: ['time', 'complexity', 'big o', 'algorithm', 'o(n)', 'o(1)', 'efficiency'],
    topic: 'time-complexity',
    taskBreakdown: [
      'Step 1: What is Big O',
      'Step 2: O(1) Constant Time',
      'Step 3: O(n) Linear Time',
      'Step 4: O(n squared) Quadratic'
    ],
    explanation: `Time Complexity - Big O Notation

O(1) Constant: Time stays same regardless of input. Array index access.

O(log n) Logarithmic: Very efficient. Binary search.

O(n) Linear: Time grows with input. Loop through array.

O(n squared) Quadratic: Slow for large input. Nested loops.`,
    steps: [
      {
        narration: "Time complexity measures how algorithm speed changes with input size.",
        drawCommands: [
          { type: 'text', x: 220, y: 25, props: { text: 'TIME COMPLEXITY - BIG O', color: 'black' } }
        ]
      },
      {
        narration: "Here's a graph. X axis is input size, Y axis is time taken.",
        drawCommands: [
          { type: 'arrow', x: 0, y: 0, props: { start: { x: 80, y: 400 }, end: { x: 80, y: 80 }, color: 'black' } },
          { type: 'arrow', x: 0, y: 0, props: { start: { x: 80, y: 400 }, end: { x: 500, y: 400 }, color: 'black' } },
          { type: 'text', x: 40, y: 70, props: { text: 'Time', color: 'black' } },
          { type: 'text', x: 460, y: 420, props: { text: 'Input n', color: 'black' } }
        ]
      },
      {
        narration: "O of 1 is constant. A flat line. Time never changes. Like accessing array by index.",
        drawCommands: [
          { type: 'line', x: 0, y: 0, props: { start: { x: 80, y: 380 }, end: { x: 450, y: 380 }, color: 'green' } },
          { type: 'text', x: 460, y: 380, props: { text: 'O(1)', color: 'green' } }
        ]
      },
      {
        narration: "O of log n grows slowly. Binary search uses this. Very efficient.",
        drawCommands: [
          { type: 'circle', x: 120, y: 350, props: { radius: 4, color: 'blue' } },
          { type: 'circle', x: 200, y: 320, props: { radius: 4, color: 'blue' } },
          { type: 'circle', x: 320, y: 300, props: { radius: 4, color: 'blue' } },
          { type: 'circle', x: 450, y: 290, props: { radius: 4, color: 'blue' } },
          { type: 'text', x: 460, y: 290, props: { text: 'O(log n)', color: 'blue' } }
        ]
      },
      {
        narration: "O of n is linear. A diagonal line. Time grows directly with input size.",
        drawCommands: [
          { type: 'line', x: 0, y: 0, props: { start: { x: 80, y: 380 }, end: { x: 350, y: 180 }, color: 'orange' } },
          { type: 'text', x: 360, y: 180, props: { text: 'O(n)', color: 'orange' } }
        ]
      },
      {
        narration: "O of n squared grows very fast. Nested loops cause this. Avoid for large data.",
        drawCommands: [
          { type: 'circle', x: 100, y: 370, props: { radius: 4, color: 'red' } },
          { type: 'circle', x: 140, y: 320, props: { radius: 4, color: 'red' } },
          { type: 'circle', x: 180, y: 230, props: { radius: 4, color: 'red' } },
          { type: 'circle', x: 220, y: 100, props: { radius: 4, color: 'red' } },
          { type: 'text', x: 230, y: 90, props: { text: 'O(n²)', color: 'red' } }
        ]
      },
      {
        narration: "Summary: O 1 is best, log n is great, n is okay, n squared is slow.",
        drawCommands: [
          { type: 'text', x: 520, y: 120, props: { text: 'BEST', color: 'green' } },
          { type: 'text', x: 520, y: 150, props: { text: 'O(1)', color: 'green' } },
          { type: 'text', x: 520, y: 200, props: { text: 'O(log n)', color: 'blue' } },
          { type: 'text', x: 520, y: 250, props: { text: 'O(n)', color: 'orange' } },
          { type: 'text', x: 520, y: 300, props: { text: 'O(n²)', color: 'red' } },
          { type: 'text', x: 520, y: 330, props: { text: 'WORST', color: 'red' } }
        ]
      }
    ]
  },

  // ============ SPACE COMPLEXITY ============
  {
    keywords: ['space', 'complexity', 'memory', 'allocation', 'ram', 'storage', 'big o space'],
    topic: 'space-complexity',
    taskBreakdown: [
      'Step 1: What is Space Complexity',
      'Step 2: O(1) Constant Space',
      'Step 3: O(n) Linear Space',
      'Step 4: O(n²) Quadratic Space'
    ],
    explanation: `Space Complexity - Memory Usage

Space complexity measures how much memory an algorithm uses.

O(1) Constant: Fixed memory, no matter input size. Using a few variables.

O(n) Linear: Memory grows with input. Storing a copy of an array.

O(n²) Quadratic: Memory grows rapidly. 2D arrays, matrices.

Trade-off: Often we trade time for space or vice versa.`,
    steps: [
      {
        narration: "Space complexity measures how much memory an algorithm uses as input grows.",
        drawCommands: [
          { type: 'text', x: 200, y: 25, props: { text: 'SPACE COMPLEXITY - MEMORY', color: 'black' } }
        ]
      },
      {
        narration: "Just like time complexity, we use Big O notation for memory usage.",
        drawCommands: [
          { type: 'arrow', x: 0, y: 0, props: { start: { x: 80, y: 400 }, end: { x: 80, y: 80 }, color: 'black' } },
          { type: 'arrow', x: 0, y: 0, props: { start: { x: 80, y: 400 }, end: { x: 500, y: 400 }, color: 'black' } },
          { type: 'text', x: 30, y: 70, props: { text: 'Memory', color: 'black' } },
          { type: 'text', x: 460, y: 420, props: { text: 'Input n', color: 'black' } }
        ]
      },
      {
        narration: "O of 1 is constant space. Uses fixed memory. Like using just a few variables.",
        drawCommands: [
          { type: 'line', x: 0, y: 0, props: { start: { x: 80, y: 370 }, end: { x: 450, y: 370 }, color: 'green' } },
          { type: 'text', x: 460, y: 370, props: { text: 'O(1)', color: 'green' } },
          { type: 'rectangle', x: 530, y: 350, props: { w: 60, h: 40, color: 'green' } },
          { type: 'text', x: 535, y: 400, props: { text: 'int x=5', color: 'green' } }
        ]
      },
      {
        narration: "O of n uses memory proportional to input. Like creating a copy of an array.",
        drawCommands: [
          { type: 'line', x: 0, y: 0, props: { start: { x: 80, y: 370 }, end: { x: 350, y: 180 }, color: 'orange' } },
          { type: 'text', x: 360, y: 180, props: { text: 'O(n)', color: 'orange' } },
          { type: 'rectangle', x: 530, y: 240, props: { w: 80, h: 30, color: 'orange' } },
          { type: 'text', x: 535, y: 280, props: { text: 'array[n]', color: 'orange' } }
        ]
      },
      {
        narration: "O of n squared uses quadratic space. Like a 2D matrix or grid.",
        drawCommands: [
          { type: 'circle', x: 100, y: 360, props: { radius: 4, color: 'red' } },
          { type: 'circle', x: 140, y: 300, props: { radius: 4, color: 'red' } },
          { type: 'circle', x: 180, y: 200, props: { radius: 4, color: 'red' } },
          { type: 'circle', x: 220, y: 90, props: { radius: 4, color: 'red' } },
          { type: 'text', x: 230, y: 80, props: { text: 'O(n²)', color: 'red' } },
          { type: 'rectangle', x: 530, y: 120, props: { w: 50, h: 50, color: 'red' } },
          { type: 'text', x: 525, y: 180, props: { text: 'matrix[n][n]', color: 'red' } }
        ]
      },
      {
        narration: "Examples: HashMap uses O n space. Recursive calls use stack space.",
        drawCommands: [
          { type: 'text', x: 80, y: 450, props: { text: 'HashMap → O(n)', color: 'blue' } },
          { type: 'text', x: 250, y: 450, props: { text: 'Recursion → O(depth)', color: 'violet' } },
          { type: 'text', x: 450, y: 450, props: { text: 'In-place → O(1)', color: 'green' } }
        ]
      },
      {
        narration: "Remember: Often we trade time for space. Caching uses more memory but is faster.",
        drawCommands: [
          { type: 'rectangle', x: 80, y: 480, props: { w: 150, h: 40, color: 'blue' } },
          { type: 'text', x: 100, y: 495, props: { text: 'More Space', color: 'blue' } },
          { type: 'arrow', x: 0, y: 0, props: { start: { x: 240, y: 500 }, end: { x: 300, y: 500 }, color: 'black' } },
          { type: 'rectangle', x: 310, y: 480, props: { w: 150, h: 40, color: 'green' } },
          { type: 'text', x: 330, y: 495, props: { text: 'Less Time', color: 'green' } }
        ]
      }
    ]
  }
];

// Semantic keywords for better matching
const SEMANTIC_SYNONYMS: Record<string, string[]> = {
  'newton': ['physics', 'mechanics', 'movement', 'f=ma', 'action reaction'],
  'motion': ['movement', 'moving', 'velocity', 'speed', 'acceleration'],
  'force': ['push', 'pull', 'f=ma', 'newton'],
  'computer': ['pc', 'laptop', 'machine', 'hardware', 'software', 'processor'],
  'cpu': ['processor', 'chip', 'brain', 'computing'],
  'memory': ['ram', 'storage', 'cache', 'hard drive', 'ssd'],
  'time': ['runtime', 'speed', 'performance', 'efficient'],
  'complexity': ['big o', 'o(n)', 'o(1)', 'efficiency', 'performance', 'algorithm'],
  'algorithm': ['sorting', 'searching', 'code', 'program', 'data structure'],
  'space': ['memory', 'storage', 'ram', 'allocation'],
};

// Find a pre-generated topic by semantic matching
export function findPreGeneratedTopic(query: string): PreGeneratedTopic | null {
  const lowerQuery = query.toLowerCase();
  
  // Expand query with synonyms
  let expandedTerms = lowerQuery.split(/\s+/);
  for (const term of expandedTerms) {
    for (const [key, synonyms] of Object.entries(SEMANTIC_SYNONYMS)) {
      if (term.includes(key) || synonyms.some(s => term.includes(s))) {
        expandedTerms.push(key, ...synonyms);
      }
    }
  }
  
  let bestMatch: PreGeneratedTopic | null = null;
  let bestScore = 0;
  
  for (const topic of preGeneratedTopics) {
    // Count keyword matches including expanded terms
    let score = 0;
    for (const keyword of topic.keywords) {
      if (lowerQuery.includes(keyword)) {
        score += 3; // Direct match scores higher
      } else if (expandedTerms.some(t => t.includes(keyword) || keyword.includes(t))) {
        score += 1; // Semantic match
      }
    }
    
    // Also check if query appears in topic name
    if (lowerQuery.includes(topic.topic.replace('-', ' '))) {
      score += 2;
    }
    
    if (score > bestScore) {
      bestScore = score;
      bestMatch = topic;
    }
  }
  
  // Return match if score is high enough (at least 2 points)
  return bestScore >= 2 ? bestMatch : null;
}

// Get all quick prompt suggestions
export function getQuickPrompts(): { label: string; query: string }[] {
  return [
    { label: "Newton's Laws", query: "Explain Newton's laws of motion" },
    { label: "Computer System", query: "Explain how a computer system works" },
    { label: "Time Complexity", query: "Explain time complexity and Big O notation" },
    { label: "Space Complexity", query: "Explain space complexity and memory usage" }
  ];
}
