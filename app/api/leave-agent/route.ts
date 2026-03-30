import { NextRequest, NextResponse } from 'next/server';
import { getStateManager } from '@/lib/state/unified-state-manager';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { id } = body;

  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 });
  }

  const manager = getStateManager();
  const removed = manager.pushStore.removeVisitor(id);

  if (!removed) {
    return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
