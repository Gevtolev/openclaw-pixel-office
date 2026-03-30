import type { UnifiedAgentState } from '@/lib/state/types';

export type ActionType = 'GOTO_SEAT' | 'WANDER' | 'GOTO_ERROR_ZONE' | 'PLAY_EFFECT' | 'REMOVE' | 'SPAWN';

export interface CharacterAction {
  type: ActionType;
  animKey?: string;
  effectKey?: string;
  speed?: number;
}

export function mapAgentToAction(agent: UnifiedAgentState): CharacterAction {
  switch (agent.state) {
    case 'writing':
      return { type: 'GOTO_SEAT', animKey: 'typing' };
    case 'researching':
      return { type: 'GOTO_SEAT', animKey: 'researching' };
    case 'executing':
      return { type: 'GOTO_SEAT', animKey: 'typing', speed: 1.5 };
    case 'idle':
      return { type: 'WANDER' };
    case 'error':
      return { type: 'GOTO_ERROR_ZONE' };
    case 'syncing':
      return { type: 'PLAY_EFFECT', effectKey: 'sync' };
    case 'offline':
      return { type: 'REMOVE' };
    default:
      return { type: 'WANDER' };
  }
}

export function diffAgents(
  prev: UnifiedAgentState[],
  next: UnifiedAgentState[]
): {
  added: UnifiedAgentState[];
  removed: UnifiedAgentState[];
  changed: UnifiedAgentState[];
} {
  const prevMap = new Map(prev.map((a) => [a.id, a]));
  const nextMap = new Map(next.map((a) => [a.id, a]));

  const added: UnifiedAgentState[] = [];
  const removed: UnifiedAgentState[] = [];
  const changed: UnifiedAgentState[] = [];

  for (const [id, agent] of nextMap) {
    const prevAgent = prevMap.get(id);
    if (!prevAgent) {
      added.push(agent);
    } else if (prevAgent.state !== agent.state) {
      changed.push(agent);
    }
  }

  for (const [id, agent] of prevMap) {
    if (!nextMap.has(id)) {
      removed.push(agent);
    }
  }

  return { added, removed, changed };
}
