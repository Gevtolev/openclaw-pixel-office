import { describe, it, expect, vi, beforeEach } from 'vitest';
import { parseAgentActivity, determineAgentState } from '@/lib/state/openclaw-reader';

describe('determineAgentState', () => {
  it('returns writing when mtime is less than 2 minutes ago', () => {
    const now = Date.now();
    expect(determineAgentState(now - 60_000, now)).toBe('writing');
  });

  it('returns idle when mtime is 2-10 minutes ago', () => {
    const now = Date.now();
    expect(determineAgentState(now - 5 * 60_000, now)).toBe('idle');
  });

  it('returns offline when mtime is more than 10 minutes ago', () => {
    const now = Date.now();
    expect(determineAgentState(now - 15 * 60_000, now)).toBe('offline');
  });
});

describe('parseAgentActivity', () => {
  it('extracts tool name from assistant message with toolCall', () => {
    const lines = [
      JSON.stringify({
        role: 'assistant',
        content: [{ type: 'toolCall', name: 'Read', input: {} }],
      }),
    ];
    const result = parseAgentActivity(lines);
    expect(result.currentTool).toBe('Read');
    expect(result.subagents).toEqual([]);
  });

  it('detects subagent spawn from session_spawn tool call', () => {
    const lines = [
      JSON.stringify({
        role: 'assistant',
        content: [
          {
            type: 'toolCall',
            name: 'session_spawn',
            input: { description: 'research task' },
            toolId: 'tool_123',
          },
        ],
      }),
    ];
    const result = parseAgentActivity(lines);
    expect(result.subagents).toHaveLength(1);
    expect(result.subagents[0].label).toBe('research task');
    expect(result.subagents[0].toolId).toBe('tool_123');
  });
});
