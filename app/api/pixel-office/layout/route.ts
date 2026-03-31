import { NextResponse } from 'next/server';
import fs from 'fs';
import { LAYOUT_FILE, PIXEL_OFFICE_DIR } from '@/lib/asset-utils';

export async function GET() {
  try {
    if (!fs.existsSync(LAYOUT_FILE)) {
      return NextResponse.json({});
    }
    const raw = fs.readFileSync(LAYOUT_FILE, 'utf-8');
    return NextResponse.json(JSON.parse(raw));
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    fs.mkdirSync(PIXEL_OFFICE_DIR, { recursive: true });
    fs.writeFileSync(LAYOUT_FILE, JSON.stringify(body, null, 2), 'utf-8');
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
