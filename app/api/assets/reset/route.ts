import { NextResponse } from 'next/server';
import fs from 'fs';
import { CUSTOM_ASSETS_DIR, checkPassword } from '@/lib/asset-utils';

export async function DELETE(req: Request) {
  const password = req.headers.get('x-asset-pass') || '';
  if (!checkPassword(password)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    if (!fs.existsSync(CUSTOM_ASSETS_DIR)) {
      return NextResponse.json({ ok: true, deleted: 0 });
    }
    const files = fs.readdirSync(CUSTOM_ASSETS_DIR);
    for (const file of files) {
      fs.unlinkSync(`${CUSTOM_ASSETS_DIR}/${file}`);
    }
    return NextResponse.json({ ok: true, deleted: files.length });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
