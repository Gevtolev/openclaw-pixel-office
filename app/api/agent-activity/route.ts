import { NextResponse } from 'next/server';
import { getStateManager } from '@/lib/state/unified-state-manager';

export const dynamic = 'force-dynamic';

export async function GET() {
  const manager = getStateManager();
  const agents = manager.getAllAgents();

  const parents = agents.filter((a) => a.role !== 'subagent');
  const subagents = agents.filter((a) => a.role === 'subagent');

  const activity = parents.map((parent) => ({
    ...parent,
    subagents: subagents.filter((s) => s.parentId === parent.id),
  }));

  return NextResponse.json(activity);
}
