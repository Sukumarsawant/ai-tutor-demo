import { Editor, createShapeId } from 'tldraw';
import type { TLShapeId, TLDefaultColorStyle } from 'tldraw';
import type { DrawCommand } from '../types';

// Valid tldraw color values
type TLColor = TLDefaultColorStyle;

// Maps color names to tldraw color values
const colorMap: Record<string, TLColor> = {
  red: 'red',
  blue: 'blue',
  green: 'green',
  orange: 'orange',
  black: 'black',
  yellow: 'yellow',
  violet: 'violet',
  grey: 'grey',
};

function getColor(color?: string): TLColor {
  return colorMap[color || 'black'] || 'black';
}

export class DrawingController {
  private editor: Editor | null = null;
  private createdShapeIds: TLShapeId[] = [];

  setEditor(editor: Editor) {
    this.editor = editor;
  }

  getEditor(): Editor | null {
    return this.editor;
  }

  // Clear all shapes created by the AI
  clearAIDrawings() {
    if (!this.editor) {
      console.warn('DrawingController: No editor set');
      return;
    }
    
    if (this.createdShapeIds.length > 0) {
      try {
        this.editor.deleteShapes(this.createdShapeIds);
      } catch (e) {
        console.error('Error clearing AI drawings:', e);
      }
      this.createdShapeIds = [];
    }
  }

  // Clear entire canvas
  clearCanvas() {
    if (!this.editor) {
      console.warn('DrawingController: No editor set, cannot clear canvas');
      return;
    }
    
    try {
      const allShapeIds = Array.from(this.editor.getCurrentPageShapeIds());
      console.log('Clearing canvas, shapes:', allShapeIds.length);
      if (allShapeIds.length > 0) {
        this.editor.deleteShapes(allShapeIds);
      }
      this.createdShapeIds = [];
    } catch (e) {
      console.error('Error clearing canvas:', e);
    }
  }

  // Execute a sequence of draw commands with delays for animation effect
  async executeDrawCommands(commands: DrawCommand[], delayBetween = 500): Promise<void> {
    if (!this.editor || !commands || commands.length === 0) return;

    for (const command of commands) {
      await this.executeCommand(command);
      await this.delay(delayBetween);
    }
  }

  // Execute a single draw command
  private async executeCommand(command: DrawCommand): Promise<TLShapeId | null> {
    if (!this.editor) return null;

    const shapeId = createShapeId();
    
    try {
      switch (command.type) {
        case 'circle':
          this.drawCircle(shapeId, command);
          break;
        case 'rectangle':
          this.drawRectangle(shapeId, command);
          break;
        case 'diamond':
          this.drawDiamond(shapeId, command);
          break;
        case 'hexagon':
          this.drawHexagon(shapeId, command);
          break;
        case 'ellipse':
          this.drawEllipse(shapeId, command);
          break;
        case 'star':
          this.drawStar(shapeId, command);
          break;
        case 'arrow':
          this.drawArrow(shapeId, command);
          break;
        case 'text':
          this.drawText(shapeId, command);
          break;
        case 'line':
          this.drawLine(shapeId, command);
          break;
        default:
          console.warn(`Unknown draw command type: ${command.type}`);
          return null;
      }

      this.createdShapeIds.push(shapeId);
      return shapeId;
    } catch (error) {
      console.error('Error executing draw command:', error);
      return null;
    }
  }

  private drawCircle(id: TLShapeId, command: DrawCommand) {
    if (!this.editor) return;

    const radius = command.props?.radius || 50;
    const color = command.props?.color || 'black';

    this.editor.createShape({
      id,
      type: 'geo',
      x: command.x - radius,
      y: command.y - radius,
      props: {
        geo: 'ellipse',
        w: radius * 2,
        h: radius * 2,
        color: getColor(color),
        fill: 'solid',
      },
    });
  }

  private drawRectangle(id: TLShapeId, command: DrawCommand) {
    if (!this.editor) return;

    const width = command.props?.w || 100;
    const height = command.props?.h || 60;
    const color = command.props?.color || 'black';

    this.editor.createShape({
      id,
      type: 'geo',
      x: command.x,
      y: command.y,
      props: {
        geo: 'rectangle',
        w: width,
        h: height,
        color: getColor(color),
        fill: 'solid',
      },
    });
  }

  private drawDiamond(id: TLShapeId, command: DrawCommand) {
    if (!this.editor) return;

    const width = command.props?.w || 80;
    const height = command.props?.h || 80;
    const color = command.props?.color || 'orange';

    this.editor.createShape({
      id,
      type: 'geo',
      x: command.x - width / 2,
      y: command.y - height / 2,
      props: {
        geo: 'diamond',
        w: width,
        h: height,
        color: getColor(color),
        fill: 'solid',
      },
    });
  }

  private drawHexagon(id: TLShapeId, command: DrawCommand) {
    if (!this.editor) return;

    const width = command.props?.w || 90;
    const height = command.props?.h || 80;
    const color = command.props?.color || 'violet';

    this.editor.createShape({
      id,
      type: 'geo',
      x: command.x - width / 2,
      y: command.y - height / 2,
      props: {
        geo: 'hexagon',
        w: width,
        h: height,
        color: getColor(color),
        fill: 'solid',
      },
    });
  }

  private drawEllipse(id: TLShapeId, command: DrawCommand) {
    if (!this.editor) return;

    const width = command.props?.w || 120;
    const height = command.props?.h || 70;
    const color = command.props?.color || 'green';

    this.editor.createShape({
      id,
      type: 'geo',
      x: command.x - width / 2,
      y: command.y - height / 2,
      props: {
        geo: 'ellipse',
        w: width,
        h: height,
        color: getColor(color),
        fill: 'solid',
      },
    });
  }

  private drawStar(id: TLShapeId, command: DrawCommand) {
    if (!this.editor) return;

    const width = command.props?.w || 80;
    const height = command.props?.h || 80;
    const color = command.props?.color || 'yellow';

    this.editor.createShape({
      id,
      type: 'geo',
      x: command.x - width / 2,
      y: command.y - height / 2,
      props: {
        geo: 'star',
        w: width,
        h: height,
        color: getColor(color),
        fill: 'solid',
      },
    });
  }

  private drawArrow(id: TLShapeId, command: DrawCommand) {
    if (!this.editor) return;

    const start = command.props?.start || { x: command.x, y: command.y };
    const end = command.props?.end || { x: command.x + 100, y: command.y };
    const color = command.props?.color || 'black';

    this.editor.createShape({
      id,
      type: 'arrow',
      x: 0,
      y: 0,
      props: {
        color: getColor(color),
        start: { x: start.x, y: start.y },
        end: { x: end.x, y: end.y },
        arrowheadEnd: 'arrow',
      },
    });
  }

  private drawText(id: TLShapeId, command: DrawCommand) {
    if (!this.editor) return;

    const text = command.props?.text || '';
    const color = command.props?.color || 'black';

    this.editor.createShape({
      id,
      type: 'text',
      x: command.x,
      y: command.y,
      props: {
        richText: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text }] }] },
        color: getColor(color),
        size: 'm',
      },
    });
  }

  private drawLine(id: TLShapeId, command: DrawCommand) {
    if (!this.editor) return;

    const start = command.props?.start || { x: command.x, y: command.y };
    const end = command.props?.end || { x: command.x + 100, y: command.y };
    const color = command.props?.color || 'black';

    // Use arrow without arrowhead for simple lines
    this.editor.createShape({
      id,
      type: 'arrow',
      x: 0,
      y: 0,
      props: {
        color: getColor(color),
        start: { x: start.x, y: start.y },
        end: { x: end.x, y: end.y },
        arrowheadStart: 'none',
        arrowheadEnd: 'none',
      },
    });
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Singleton instance
export const drawingController = new DrawingController();
