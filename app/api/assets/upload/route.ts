import { NextResponse } from 'next/server';
import fs from 'fs';
import { ensureAssetDirs, getCustomAssetPath, checkPassword, isAllowedAssetFilename } from '@/lib/asset-utils';

export async function POST(req: Request) {
  const password = req.headers.get('x-asset-pass') || '';
  if (!checkPassword(password)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    ensureAssetDirs();
    const formData = await req.formData();
    const saved: string[] = [];

    for (const [, value] of formData.entries()) {
      if (!(value instanceof File)) continue;
      const filename = value.name;
      if (!isAllowedAssetFilename(filename)) {
        return NextResponse.json(
          { error: `Invalid filename: ${filename}. Allowed: .webp/.png/.jpg` },
          { status: 400 }
        );
      }
      const buffer = Buffer.from(await value.arrayBuffer());
      fs.writeFileSync(getCustomAssetPath(filename), buffer);
      saved.push(filename);
    }

    return NextResponse.json({ ok: true, saved });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
