import { NextResponse } from 'next/server';
import { getStateManager } from '@/lib/state/unified-state-manager';

export const dynamic = 'force-dynamic';

export async function GET() {
  const manager = getStateManager();
  const agents = manager.getAllAgents();
  return NextResponse.json(agents);
}
