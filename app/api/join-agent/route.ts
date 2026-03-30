import { NextRequest, NextResponse } from 'next/server';
import { getStateManager } from '@/lib/state/unified-state-manager';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { id, name, emoji, joinKey } = body;

  if (!id || !name) {
    return NextResponse.json({ error: 'id and name are required' }, { status: 400 });
  }

  // TODO: validate joinKey against join-keys.json in Plan 3
  void joinKey;

  const manager = getStateManager();

  if (manager.pushStore.hasVisitor(id)) {
    return NextResponse.json({ error: 'Agent already joined' }, { status: 409 });
  }

  manager.pushStore.addVisitor(id, name, emoji || '🤖');
  return NextResponse.json({ ok: true, id, name });
}
