import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { PIXEL_OFFICE_DIR, checkPassword } from '@/lib/asset-utils';

const GEMINI_CONFIG_FILE = path.join(PIXEL_OFFICE_DIR, 'gemini.json');

export async function GET() {
  try {
    if (!fs.existsSync(GEMINI_CONFIG_FILE)) {
      return NextResponse.json({ apiKey: '', hasKey: false });
    }
    const raw = fs.readFileSync(GEMINI_CONFIG_FILE, 'utf-8');
    const config = JSON.parse(raw);
    const key: string = config.apiKey || '';
    const masked = key.length > 4 ? '•'.repeat(key.length - 4) + key.slice(-4) : key;
    return NextResponse.json({ apiKey: masked, hasKey: key.length > 0 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const password = req.headers.get('x-asset-pass') || '';
  if (!checkPassword(password)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { apiKey } = await req.json();
    if (typeof apiKey !== 'string') {
      return NextResponse.json({ error: 'apiKey must be a string' }, { status: 400 });
    }
    fs.mkdirSync(PIXEL_OFFICE_DIR, { recursive: true });
    fs.writeFileSync(GEMINI_CONFIG_FILE, JSON.stringify({ apiKey }, null, 2), 'utf-8');
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
