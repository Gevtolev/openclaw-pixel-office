import { readOpenClawAgents } from './openclaw-reader';
import { ApiPushStore } from './api-push-store';
import { CacheEntry } from '@/lib/config-cache';
import type { UnifiedAgentState } from './types';

const OPENCLAW_CACHE_TTL = 5000; // 5 seconds

export class UnifiedStateManager {
  public readonly pushStore = new ApiPushStore();
  private openclawCache: CacheEntry<UnifiedAgentState[]>;

  constructor() {
    this.openclawCache = new CacheEntry(() => {
      try {
        return readOpenClawAgents();
      } catch {
        return [];
      }
    }, OPENCLAW_CACHE_TTL);
  }

  getAllAgents(): UnifiedAgentState[] {
    this.pushStore.cleanExpired();

    const openclawAgents = this.openclawCache.get();
    const pushAgents = this.pushStore.getAll();

    // Merge: openclaw agents take priority for dedup
    const agentMap = new Map<string, UnifiedAgentState>();

    for (const agent of pushAgents) {
      agentMap.set(agent.id, agent);
    }

    for (const agent of openclawAgents) {
      agentMap.set(agent.id, agent);
    }

    return Array.from(agentMap.values());
  }

  invalidateCache(): void {
    this.openclawCache.invalidate();
  }
}

// Singleton instance for API routes
let _instance: UnifiedStateManager | null = null;

export function getStateManager(): UnifiedStateManager {
  if (!_instance) {
    _instance = new UnifiedStateManager();
  }
  return _instance;
}
