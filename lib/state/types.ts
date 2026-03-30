export type AgentSource = 'openclaw' | 'api-push';
export type AgentRole = 'primary' | 'agent' | 'subagent' | 'visitor';
export type AgentState =
  | 'idle'
  | 'writing'
  | 'researching'
  | 'executing'
  | 'syncing'
  | 'error'
  | 'offline';

export interface UnifiedAgentState {
  id: string;
  name: string;
  emoji: string;
  source: AgentSource;
  role: AgentRole;
  state: AgentState;
  currentTool?: string;
  parentId?: string;
  message?: string;
  model?: string;
  platforms?: string[];
  lastActive: number;
  tokenUsage?: { input: number; output: number };
}

export interface SubagentInfo {
  toolId: string;
  label: string;
  sessionKey?: string;
  childSessionKey?: string;
  state: AgentState;
  lastActive: number;
}

export interface OfficeLayout {
  collisionMap: boolean[][];
  waypoints: Record<string, { x: number; y: number }>;
  furniture: Array<{
    type: string;
    x: number;
    y: number;
    rotation?: number;
  }>;
}

export interface JoinKeyConfig {
  key: string;
  maxConcurrency: number;
  createdAt: number;
}
