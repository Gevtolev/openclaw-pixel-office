import { NextRequest, NextResponse } from 'next/server';
import { getStateManager } from '@/lib/state/unified-state-manager';
import type { AgentState } from '@/lib/state/types';

const VALID_STATES: AgentState[] = [
  'idle', 'writing', 'researching', 'executing', 'syncing', 'error',
];

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { state, message } = body;

  if (!state || !VALID_STATES.includes(state)) {
    return NextResponse.json(
      { error: `Invalid state. Must be one of: ${VALID_STATES.join(', ')}` },
      { status: 400 }
    );
  }

  const manager = getStateManager();
  manager.pushStore.setPrimaryState(state, message);
  return NextResponse.json({ ok: true, state, message });
}
