// Step Sync Controller - coordinates speech with drawing step by step
// This ensures narration and drawing happen together without lag

import { elevenLabsService } from './elevenLabsService';
import { drawingController } from './drawingController';
import type { TeachingStep } from './preGeneratedTopics';
import type { DrawCommand } from '../types';

class StepSyncController {
  private isRunning = false;
  private shouldStop = false;

  // Execute steps with synchronized speech and drawing
  async executeSteps(
    steps: TeachingStep[],
    onStepStart?: (stepIndex: number, totalSteps: number) => void,
    onComplete?: () => void
  ): Promise<void> {
    this.isRunning = true;
    this.shouldStop = false;

    for (let i = 0; i < steps.length; i++) {
      if (this.shouldStop) break;

      const step = steps[i];
      onStepStart?.(i, steps.length);

      // Execute speech and drawing in parallel, wait for both
      await this.executeStepSync(step.narration, step.drawCommands);
      
      // Small pause between steps
      if (!this.shouldStop && i < steps.length - 1) {
        await this.delay(500);
      }
    }

    this.isRunning = false;
    onComplete?.();
  }

  // Execute speech and drawing together for a single step
  private async executeStepSync(narration: string, drawCommands: DrawCommand[]): Promise<void> {
    if (this.shouldStop) return;

    // Calculate timing based on word count
    const wordCount = narration.split(' ').length;
    // ElevenLabs speaks ~150 words/min = 400ms per word
    const estimatedSpeechMs = Math.max(wordCount * 400, 2000);
    const delayPerCommand = drawCommands.length > 0 
      ? Math.floor(estimatedSpeechMs / (drawCommands.length + 1))
      : 0;

    // Start drawing first (slightly ahead)
    const drawPromise = this.drawWithTiming(drawCommands, delayPerCommand);

    // Start speech with slight delay so drawing begins first
    await this.delay(200);
    const speechPromise = narration 
      ? elevenLabsService.speak(narration) 
      : Promise.resolve();

    // Wait for both to complete
    await Promise.all([speechPromise, drawPromise]);
  }

  // Draw commands with timing to match speech duration
  private async drawWithTiming(commands: DrawCommand[], delayBetween: number): Promise<void> {
    if (!commands || commands.length === 0) return;

    for (const command of commands) {
      if (this.shouldStop) break;
      
      await drawingController.executeDrawCommands([command], 0);
      
      if (delayBetween > 0) {
        await this.delay(delayBetween);
      }
    }
  }

  // Execute regular AI response (non-pre-generated)
  async executeAIResponse(
    narration: string | undefined,
    drawCommands: DrawCommand[] | undefined,
    onSpeechStart?: () => void,
    onComplete?: () => void
  ): Promise<void> {
    this.isRunning = true;
    this.shouldStop = false;

    if (!drawCommands || drawCommands.length === 0) {
      // No drawing, just speak
      if (narration) {
        onSpeechStart?.();
        await elevenLabsService.speak(narration);
      }
    } else {
      // Group commands into chunks for better sync
      const chunks = this.chunkCommands(drawCommands, 3);
      const narrateSentences = narration ? this.splitIntoSentences(narration) : [];
      
      onSpeechStart?.();

      // If we have sentences, try to sync them with chunks
      if (narrateSentences.length > 0) {
        const sentencesPerChunk = Math.max(1, Math.floor(narrateSentences.length / chunks.length));
        
        for (let i = 0; i < chunks.length && !this.shouldStop; i++) {
          // Get sentences for this chunk
          const startSentence = i * sentencesPerChunk;
          const endSentence = i === chunks.length - 1 
            ? narrateSentences.length 
            : (i + 1) * sentencesPerChunk;
          const chunkNarration = narrateSentences.slice(startSentence, endSentence).join(' ');

          // Speak and draw this chunk
          await this.executeStepSync(chunkNarration, chunks[i]);
        }
      } else {
        // No narration, just draw with delays
        await drawingController.executeDrawCommands(drawCommands, 400);
      }
    }

    this.isRunning = false;
    onComplete?.();
  }

  // Split commands into chunks for better step-by-step execution
  private chunkCommands(commands: DrawCommand[], chunkSize: number): DrawCommand[][] {
    const chunks: DrawCommand[][] = [];
    for (let i = 0; i < commands.length; i += chunkSize) {
      chunks.push(commands.slice(i, i + chunkSize));
    }
    return chunks;
  }

  // Split text into sentences
  private splitIntoSentences(text: string): string[] {
    return text
      .split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 0);
  }

  // Stop execution
  stop(): void {
    this.shouldStop = true;
    elevenLabsService.stop();
    this.isRunning = false;
  }

  // Check if currently running
  isExecuting(): boolean {
    return this.isRunning;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const stepSyncController = new StepSyncController();
