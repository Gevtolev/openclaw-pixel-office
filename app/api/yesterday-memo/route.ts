import { NextResponse } from 'next/server';
import { getYesterdayMemo } from '@/lib/memo-utils';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const memo = getYesterdayMemo();
    return NextResponse.json({ memo });
  } catch {
    return NextResponse.json({ memo: null });
  }
}
