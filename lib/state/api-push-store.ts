import type { UnifiedAgentState, AgentState } from './types';

const VISITOR_TTL_MS = 5 * 60 * 1000;
const WORK_STATE_TTL_MS = 300 * 1000;

const WORK_STATES: AgentState[] = ['writing', 'researching', 'executing', 'syncing', 'error'];

interface VisitorEntry {
  id: string;
  name: string;
  emoji: string;
  state: AgentState;
  message?: string;
  lastHeartbeat: number;
}

interface PrimaryEntry {
  state: AgentState;
  message?: string;
  lastUpdate: number;
}

export class ApiPushStore {
  private primary: PrimaryEntry = { state: 'idle', lastUpdate: Date.now() };
  private visitors = new Map<string, VisitorEntry>();

  setPrimaryState(state: AgentState, message?: string): void {
    this.primary = { state, message, lastUpdate: Date.now() };
  }

  addVisitor(id: string, name: string, emoji: string): void {
    this.visitors.set(id, {
      id,
      name,
      emoji,
      state: 'idle',
      lastHeartbeat: Date.now(),
    });
  }

  updateVisitor(id: string, state: AgentState, message?: string): boolean {
    const v = this.visitors.get(id);
    if (!v) return false;
    v.state = state;
    v.message = message;
    v.lastHeartbeat = Date.now();
    return true;
  }

  removeVisitor(id: string): boolean {
    return this.visitors.delete(id);
  }

  hasVisitor(id: string): boolean {
    return this.visitors.has(id);
  }

  cleanExpired(): void {
    const now = Date.now();

    if (
      WORK_STATES.includes(this.primary.state) &&
      now - this.primary.lastUpdate > WORK_STATE_TTL_MS
    ) {
      this.primary.state = 'idle';
    }

    for (const [id, v] of this.visitors) {
      if (now - v.lastHeartbeat > VISITOR_TTL_MS) {
        this.visitors.delete(id);
      }
    }
  }

  getAll(): UnifiedAgentState[] {
    const result: UnifiedAgentState[] = [];

    result.push({
      id: 'primary',
      name: 'Star',
      emoji: '⭐',
      source: 'api-push',
      role: 'primary',
      state: this.primary.state,
      message: this.primary.message,
      lastActive: this.primary.lastUpdate,
    });

    for (const v of this.visitors.values()) {
      result.push({
        id: `visitor:${v.id}`,
        name: v.name,
        emoji: v.emoji,
        source: 'api-push',
        role: 'visitor',
        state: v.state,
        message: v.message,
        lastActive: v.lastHeartbeat,
      });
    }

    return result;
  }
}
