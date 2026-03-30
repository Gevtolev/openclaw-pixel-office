import { NextRequest, NextResponse } from 'next/server';
import { getStateManager } from '@/lib/state/unified-state-manager';
import type { AgentState } from '@/lib/state/types';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { id, state, message } = body;

  if (!id || !state) {
    return NextResponse.json({ error: 'id and state are required' }, { status: 400 });
  }

  const manager = getStateManager();
  const updated = manager.pushStore.updateVisitor(id, state as AgentState, message);

  if (!updated) {
    return NextResponse.json({ error: 'Agent not found. Call /api/join-agent first.' }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
