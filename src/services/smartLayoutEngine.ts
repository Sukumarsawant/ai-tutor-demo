// Smart Layout Engine - Auto-layout algorithms for tldraw diagrams
// Supports: flow, tree, radial, grid, mind-map layouts
// No manual x/y needed - positions calculated automatically

export type LayoutType = 'flow' | 'tree' | 'radial' | 'grid' | 'mindmap' | 'timeline';
export type ShapeType = 'rectangle' | 'circle' | 'diamond' | 'hexagon' | 'pill' | 'cloud' | 'star';
export type ConnectionStyle = 'arrow' | 'line' | 'dashed' | 'curved';

export interface DiagramNode {
  id: string;
  label: string;
  type?: 'primary' | 'secondary' | 'tertiary' | 'input' | 'output' | 'process' | 'decision' | 'data';
  shape?: ShapeType;
  color?: string;
  children?: string[]; // IDs of child nodes
  metadata?: Record<string, any>;
}

export interface DiagramConnection {
  from: string;
  to: string;
  label?: string;
  style?: ConnectionStyle;
  color?: string;
}

export interface DiagramSpec {
  title?: string;
  layout: LayoutType;
  nodes: DiagramNode[];
  connections?: DiagramConnection[];
  theme?: 'light' | 'dark' | 'colorful';
}

export interface PositionedElement {
  type: 'shape' | 'text' | 'arrow' | 'line';
  x: number;
  y: number;
  props: Record<string, any>;
}

// Canvas dimensions
const CANVAS = { width: 800, height: 600 };
const PADDING = 60;

// Spacing between nodes (can be adjusted)

// Color palette by type
const TYPE_COLORS: Record<string, string> = {
  primary: 'blue',
  secondary: 'green',
  tertiary: 'orange',
  input: 'green',
  output: 'red',
  process: 'blue',
  decision: 'orange',
  data: 'violet',
  default: 'black'
};

// Shape sizes
const SHAPE_SIZES: Record<ShapeType, { w: number; h: number }> = {
  rectangle: { w: 100, h: 50 },
  circle: { w: 60, h: 60 },
  diamond: { w: 70, h: 70 },
  hexagon: { w: 80, h: 70 },
  pill: { w: 100, h: 40 },
  cloud: { w: 100, h: 60 },
  star: { w: 60, h: 60 }
};

// Get shape based on node type
function getShapeForType(type?: string): ShapeType {
  const shapeMap: Record<string, ShapeType> = {
    primary: 'rectangle',
    secondary: 'pill',
    tertiary: 'circle',
    input: 'hexagon',
    output: 'hexagon',
    process: 'rectangle',
    decision: 'diamond',
    data: 'rectangle'
  };
  return shapeMap[type || 'default'] || 'rectangle';
}

// Calculate text width (approximate)
function getTextWidth(text: string): number {
  return Math.min(text.length * 8, 120);
}

// Ensure shape is big enough for text
function getNodeSize(node: DiagramNode): { w: number; h: number } {
  const shape = node.shape || getShapeForType(node.type);
  const baseSize = SHAPE_SIZES[shape];
  const textWidth = getTextWidth(node.label) + 20;
  return {
    w: Math.max(baseSize.w, textWidth),
    h: baseSize.h
  };
}

// FLOW LAYOUT: Left to right or top to bottom
function layoutFlow(spec: DiagramSpec): Map<string, { x: number; y: number; size: { w: number; h: number } }> {
  const positions = new Map();
  const nodes = spec.nodes;
  
  // Find root nodes (nodes with no incoming connections)
  const hasIncoming = new Set(spec.connections?.map(c => c.to) || []);
  const roots = nodes.filter(n => !hasIncoming.has(n.id));
  
  // BFS to assign levels
  const levels: Map<string, number> = new Map();
  const queue = roots.map(r => ({ id: r.id, level: 0 }));
  
  while (queue.length > 0) {
    const { id, level } = queue.shift()!;
    if (levels.has(id)) continue;
    levels.set(id, level);
    
    const children = spec.connections?.filter(c => c.from === id).map(c => c.to) || [];
    children.forEach(child => queue.push({ id: child, level: level + 1 }));
  }
  
  // Assign any unconnected nodes
  nodes.forEach(n => {
    if (!levels.has(n.id)) levels.set(n.id, 0);
  });
  
  // Group by level
  const levelGroups: Map<number, DiagramNode[]> = new Map();
  nodes.forEach(n => {
    const level = levels.get(n.id) || 0;
    if (!levelGroups.has(level)) levelGroups.set(level, []);
    levelGroups.get(level)!.push(n);
  });
  
  // Position each level
  const maxLevel = Math.max(...Array.from(levels.values()));
  const levelWidth = (CANVAS.width - PADDING * 2) / (maxLevel + 1);
  
  levelGroups.forEach((nodesAtLevel, level) => {
    const startX = PADDING + level * levelWidth + levelWidth / 2;
    const levelHeight = (CANVAS.height - PADDING * 2) / nodesAtLevel.length;
    
    nodesAtLevel.forEach((node, idx) => {
      const size = getNodeSize(node);
      const y = PADDING + idx * levelHeight + levelHeight / 2;
      positions.set(node.id, { x: startX, y, size });
    });
  });
  
  return positions;
}

// TREE LAYOUT: Hierarchical top-down
function layoutTree(spec: DiagramSpec): Map<string, { x: number; y: number; size: { w: number; h: number } }> {
  const positions = new Map();
  const nodes = spec.nodes;
  
  // Find root (first node or node with most outgoing connections)
  const root = nodes[0];
  if (!root) return positions;
  
  // BFS to build tree structure
  const visited = new Set<string>();
  const levels: DiagramNode[][] = [[root]];
  visited.add(root.id);
  
  let currentLevel = [root];
  while (currentLevel.length > 0) {
    const nextLevel: DiagramNode[] = [];
    currentLevel.forEach(node => {
      const children = spec.connections?.filter(c => c.from === node.id).map(c => c.to) || [];
      children.forEach(childId => {
        if (!visited.has(childId)) {
          visited.add(childId);
          const childNode = nodes.find(n => n.id === childId);
          if (childNode) nextLevel.push(childNode);
        }
      });
    });
    if (nextLevel.length > 0) levels.push(nextLevel);
    currentLevel = nextLevel;
  }
  
  // Add unvisited nodes to last level
  nodes.forEach(n => {
    if (!visited.has(n.id)) {
      levels[levels.length - 1].push(n);
    }
  });
  
  // Position nodes
  const levelHeight = (CANVAS.height - PADDING * 2) / levels.length;
  
  levels.forEach((nodesAtLevel, levelIdx) => {
    const levelWidth = (CANVAS.width - PADDING * 2) / nodesAtLevel.length;
    const y = PADDING + levelIdx * levelHeight + 40;
    
    nodesAtLevel.forEach((node, idx) => {
      const size = getNodeSize(node);
      const x = PADDING + idx * levelWidth + levelWidth / 2;
      positions.set(node.id, { x, y, size });
    });
  });
  
  return positions;
}

// RADIAL LAYOUT: Center node with others in a circle
function layoutRadial(spec: DiagramSpec): Map<string, { x: number; y: number; size: { w: number; h: number } }> {
  const positions = new Map();
  const nodes = spec.nodes;
  
  if (nodes.length === 0) return positions;
  
  const centerX = CANVAS.width / 2;
  const centerY = CANVAS.height / 2;
  const radius = Math.min(CANVAS.width, CANVAS.height) / 2 - PADDING - 50;
  
  // First node is center
  const centerNode = nodes[0];
  positions.set(centerNode.id, { 
    x: centerX, 
    y: centerY, 
    size: getNodeSize(centerNode) 
  });
  
  // Other nodes in a circle
  const remaining = nodes.slice(1);
  remaining.forEach((node, idx) => {
    const angle = (2 * Math.PI * idx) / remaining.length - Math.PI / 2;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    positions.set(node.id, { x, y, size: getNodeSize(node) });
  });
  
  return positions;
}

// GRID LAYOUT: Simple grid arrangement
function layoutGrid(spec: DiagramSpec): Map<string, { x: number; y: number; size: { w: number; h: number } }> {
  const positions = new Map();
  const nodes = spec.nodes;
  
  const cols = Math.ceil(Math.sqrt(nodes.length));
  const rows = Math.ceil(nodes.length / cols);
  
  const cellWidth = (CANVAS.width - PADDING * 2) / cols;
  const cellHeight = (CANVAS.height - PADDING * 2) / rows;
  
  nodes.forEach((node, idx) => {
    const col = idx % cols;
    const row = Math.floor(idx / cols);
    const x = PADDING + col * cellWidth + cellWidth / 2;
    const y = PADDING + row * cellHeight + cellHeight / 2;
    positions.set(node.id, { x, y, size: getNodeSize(node) });
  });
  
  return positions;
}

// MINDMAP LAYOUT: Central topic with branching subtopics
function layoutMindmap(spec: DiagramSpec): Map<string, { x: number; y: number; size: { w: number; h: number } }> {
  const positions = new Map();
  const nodes = spec.nodes;
  
  if (nodes.length === 0) return positions;
  
  const centerX = CANVAS.width / 2;
  const centerY = CANVAS.height / 2;
  
  // Center node
  const centerNode = nodes[0];
  positions.set(centerNode.id, { x: centerX, y: centerY, size: getNodeSize(centerNode) });
  
  // Split remaining into left and right branches
  const remaining = nodes.slice(1);
  const leftNodes = remaining.filter((_, i) => i % 2 === 0);
  const rightNodes = remaining.filter((_, i) => i % 2 === 1);
  
  // Position left nodes
  const leftSpacing = (CANVAS.height - PADDING * 2) / (leftNodes.length + 1);
  leftNodes.forEach((node, idx) => {
    const y = PADDING + (idx + 1) * leftSpacing;
    const x = PADDING + 80;
    positions.set(node.id, { x, y, size: getNodeSize(node) });
  });
  
  // Position right nodes
  const rightSpacing = (CANVAS.height - PADDING * 2) / (rightNodes.length + 1);
  rightNodes.forEach((node, idx) => {
    const y = PADDING + (idx + 1) * rightSpacing;
    const x = CANVAS.width - PADDING - 80;
    positions.set(node.id, { x, y, size: getNodeSize(node) });
  });
  
  return positions;
}

// TIMELINE LAYOUT: Horizontal timeline
function layoutTimeline(spec: DiagramSpec): Map<string, { x: number; y: number; size: { w: number; h: number } }> {
  const positions = new Map();
  const nodes = spec.nodes;
  
  const spacing = (CANVAS.width - PADDING * 2) / (nodes.length + 1);
  const centerY = CANVAS.height / 2;
  
  nodes.forEach((node, idx) => {
    const x = PADDING + (idx + 1) * spacing;
    const y = centerY + (idx % 2 === 0 ? -60 : 60); // Alternate above/below
    positions.set(node.id, { x, y, size: getNodeSize(node) });
  });
  
  return positions;
}

// Main layout function
function calculateLayout(spec: DiagramSpec): Map<string, { x: number; y: number; size: { w: number; h: number } }> {
  switch (spec.layout) {
    case 'flow': return layoutFlow(spec);
    case 'tree': return layoutTree(spec);
    case 'radial': return layoutRadial(spec);
    case 'grid': return layoutGrid(spec);
    case 'mindmap': return layoutMindmap(spec);
    case 'timeline': return layoutTimeline(spec);
    default: return layoutGrid(spec);
  }
}

// Convert diagram spec to draw commands
export function generateDiagramCommands(spec: DiagramSpec): PositionedElement[] {
  const elements: PositionedElement[] = [];
  const positions = calculateLayout(spec);
  
  // Title
  if (spec.title) {
    elements.push({
      type: 'text',
      x: CANVAS.width / 2 - getTextWidth(spec.title) / 2,
      y: 20,
      props: { text: spec.title, color: 'black' }
    });
  }
  
  // Draw connections first (so they're behind shapes)
  spec.connections?.forEach(conn => {
    const fromPos = positions.get(conn.from);
    const toPos = positions.get(conn.to);
    if (fromPos && toPos) {
      elements.push({
        type: conn.style === 'line' ? 'line' : 'arrow',
        x: 0,
        y: 0,
        props: {
          start: { x: fromPos.x, y: fromPos.y },
          end: { x: toPos.x, y: toPos.y },
          color: conn.color || 'black'
        }
      });
      
      // Connection label
      if (conn.label) {
        const midX = (fromPos.x + toPos.x) / 2;
        const midY = (fromPos.y + toPos.y) / 2 - 15;
        elements.push({
          type: 'text',
          x: midX - getTextWidth(conn.label) / 2,
          y: midY,
          props: { text: conn.label, color: 'grey' }
        });
      }
    }
  });
  
  // Draw nodes
  spec.nodes.forEach(node => {
    const pos = positions.get(node.id);
    if (!pos) return;
    
    const shape = node.shape || getShapeForType(node.type);
    const color = node.color || TYPE_COLORS[node.type || 'default'];
    const { w, h } = pos.size;
    
    // Draw shape
    if (shape === 'circle') {
      elements.push({
        type: 'shape',
        x: pos.x,
        y: pos.y,
        props: { 
          shapeType: 'circle',
          radius: Math.max(w, h) / 2,
          color 
        }
      });
    } else if (shape === 'diamond') {
      elements.push({
        type: 'shape',
        x: pos.x,
        y: pos.y,
        props: { 
          shapeType: 'diamond',
          w, h,
          color 
        }
      });
    } else {
      elements.push({
        type: 'shape',
        x: pos.x - w / 2,
        y: pos.y - h / 2,
        props: { 
          shapeType: 'rectangle',
          w, h,
          color 
        }
      });
    }
    
    // Draw label (centered in shape)
    elements.push({
      type: 'text',
      x: pos.x - getTextWidth(node.label) / 2,
      y: pos.y + h / 2 + 15, // Below shape
      props: { text: node.label, color }
    });
  });
  
  return elements;
}

// Convert positioned elements to tldraw draw commands
export function toDrawCommands(elements: PositionedElement[]): any[] {
  return elements.map(el => {
    switch (el.type) {
      case 'shape':
        if (el.props.shapeType === 'circle') {
          return {
            type: 'circle',
            x: el.x,
            y: el.y,
            props: { radius: el.props.radius, color: el.props.color }
          };
        } else if (el.props.shapeType === 'diamond') {
          return {
            type: 'diamond',
            x: el.x,
            y: el.y,
            props: { w: el.props.w, h: el.props.h, color: el.props.color }
          };
        } else {
          return {
            type: 'rectangle',
            x: el.x,
            y: el.y,
            props: { w: el.props.w, h: el.props.h, color: el.props.color }
          };
        }
      case 'text':
        return {
          type: 'text',
          x: el.x,
          y: el.y,
          props: { text: el.props.text, color: el.props.color }
        };
      case 'arrow':
        return {
          type: 'arrow',
          x: 0,
          y: 0,
          props: el.props
        };
      case 'line':
        return {
          type: 'line',
          x: 0,
          y: 0,
          props: el.props
        };
      default:
        return null;
    }
  }).filter(Boolean);
}

// Helper to create diagram spec from simple format
export function createDiagramFromSimple(
  title: string,
  items: string[],
  layout: LayoutType = 'flow',
  connections?: [number, number][]
): DiagramSpec {
  const nodes: DiagramNode[] = items.map((label, idx) => ({
    id: `node-${idx}`,
    label,
    type: idx === 0 ? 'primary' : idx < 3 ? 'secondary' : 'tertiary'
  }));
  
  const conns: DiagramConnection[] = connections?.map(([from, to]) => ({
    from: `node-${from}`,
    to: `node-${to}`
  })) || [];
  
  // Auto-connect sequentially if no connections specified
  if (conns.length === 0 && layout === 'flow') {
    for (let i = 0; i < nodes.length - 1; i++) {
      conns.push({ from: nodes[i].id, to: nodes[i + 1].id });
    }
  }
  
  return { title, layout, nodes, connections: conns };
}
