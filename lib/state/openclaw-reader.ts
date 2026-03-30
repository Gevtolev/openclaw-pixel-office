import fs from 'fs';
import path from 'path';
import { getAgentsDir } from '@/lib/openclaw-paths';
import type { UnifiedAgentState, AgentState, SubagentInfo } from './types';

const TWO_MINUTES = 2 * 60 * 1000;
const TEN_MINUTES = 10 * 60 * 1000;

export function determineAgentState(mtimeMs: number, nowMs: number): AgentState {
  const age = nowMs - mtimeMs;
  if (age < TWO_MINUTES) return 'writing';
  if (age < TEN_MINUTES) return 'idle';
  return 'offline';
}

interface ParsedActivity {
  currentTool?: string;
  subagents: SubagentInfo[];
}

export function parseAgentActivity(lines: string[]): ParsedActivity {
  let currentTool: string | undefined;
  const subagents: SubagentInfo[] = [];

  for (const line of lines) {
    try {
      const msg = JSON.parse(line);
      if (msg.role !== 'assistant' || !Array.isArray(msg.content)) continue;

      for (const block of msg.content) {
        if (block.type === 'toolCall') {
          currentTool = block.name;

          if (block.name === 'session_spawn' || block.name === 'sessions_spawn') {
            subagents.push({
              toolId: block.toolId || '',
              label: block.input?.description || block.input?.prompt?.slice(0, 50) || 'subtask',
              sessionKey: block.input?.sessionKey,
              state: 'writing',
              lastActive: Date.now(),
            });
          }
        }
      }
    } catch {
      // skip malformed lines
    }
  }

  return { currentTool, subagents };
}

function parseIdentityName(identityPath: string): { name: string; emoji: string } {
  try {
    const content = fs.readFileSync(identityPath, 'utf-8');
    const nameMatch = content.match(/\*\*Name:\*\*\s*(.+)/);
    const name = nameMatch?.[1]?.trim() || path.basename(path.dirname(path.dirname(identityPath)));
    const emojiMatch = name.match(/^(\p{Emoji_Presentation}|\p{Emoji}\uFE0F)/u);
    const emoji = emojiMatch?.[0] || '🤖';
    const cleanName = name.replace(/^(\p{Emoji_Presentation}|\p{Emoji}\uFE0F)\s*/u, '');
    return { name: cleanName || name, emoji };
  } catch {
    return { name: path.basename(path.dirname(path.dirname(identityPath))), emoji: '🤖' };
  }
}

export function readOpenClawAgents(): UnifiedAgentState[] {
  const agentsDir = getAgentsDir();
  const now = Date.now();

  if (!fs.existsSync(agentsDir)) return [];

  const agentDirs = fs.readdirSync(agentsDir).filter((d) => {
    const fullPath = path.join(agentsDir, d);
    return fs.statSync(fullPath).isDirectory();
  });

  const agents: UnifiedAgentState[] = [];

  for (const agentId of agentDirs) {
    const agentPath = path.join(agentsDir, agentId);
    const identityPath = path.join(agentPath, 'agent', 'IDENTITY.md');
    const sessionsDir = path.join(agentPath, 'sessions');

    const { name, emoji } = parseIdentityName(identityPath);

    let newestMtime = 0;
    let newestSessionPath = '';

    if (fs.existsSync(sessionsDir)) {
      const sessionFiles = fs.readdirSync(sessionsDir).filter((f) => f.endsWith('.jsonl'));
      for (const sf of sessionFiles) {
        const fp = path.join(sessionsDir, sf);
        const stat = fs.statSync(fp);
        if (stat.mtimeMs > newestMtime) {
          newestMtime = stat.mtimeMs;
          newestSessionPath = fp;
        }
      }
    }

    const state = newestMtime > 0 ? determineAgentState(newestMtime, now) : 'offline';

    let currentTool: string | undefined;
    let subagentInfos: SubagentInfo[] = [];

    if (newestSessionPath && state === 'writing') {
      try {
        const content = fs.readFileSync(newestSessionPath, 'utf-8');
        const lines = content.trim().split('\n');
        const recentLines = lines.slice(-50);
        const parsed = parseAgentActivity(recentLines);
        currentTool = parsed.currentTool;
        subagentInfos = parsed.subagents;
      } catch {
        // ignore read errors
      }
    }

    agents.push({
      id: agentId,
      name,
      emoji,
      source: 'openclaw',
      role: 'agent',
      state,
      currentTool,
      lastActive: newestMtime || 0,
    });

    for (const sub of subagentInfos) {
      agents.push({
        id: `${agentId}:sub:${sub.toolId}`,
        name: sub.label,
        emoji: '⚡',
        source: 'openclaw',
        role: 'subagent',
        state: sub.state,
        parentId: agentId,
        lastActive: sub.lastActive,
      });
    }
  }

  return agents;
}
