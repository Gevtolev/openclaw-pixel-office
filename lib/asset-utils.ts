import fs from 'fs';
import path from 'path';
import { OPENCLAW_PIXEL_OFFICE_DIR } from '@/lib/openclaw-paths';

export const PIXEL_OFFICE_DIR = OPENCLAW_PIXEL_OFFICE_DIR;
export const CUSTOM_ASSETS_DIR = path.join(PIXEL_OFFICE_DIR, 'assets', 'custom');
export const BG_HISTORY_DIR = path.join(PIXEL_OFFICE_DIR, 'assets', 'bg-history');
export const LAYOUT_FILE = path.join(PIXEL_OFFICE_DIR, 'layout.json');

export function ensureAssetDirs(): void {
  fs.mkdirSync(CUSTOM_ASSETS_DIR, { recursive: true });
  fs.mkdirSync(BG_HISTORY_DIR, { recursive: true });
}

export function getCustomAssetPath(filename: string): string {
  return path.join(CUSTOM_ASSETS_DIR, filename);
}

export function getAssetDrawerPassword(): string {
  return process.env.ASSET_DRAWER_PASS || 'openclaw';
}

export function checkPassword(provided: string): boolean {
  return provided === getAssetDrawerPassword();
}

export const ALLOWED_ASSET_EXTS = new Set(['.webp', '.png', '.jpg', '.jpeg']);

export function isAllowedAssetFilename(filename: string): boolean {
  const ext = path.extname(filename).toLowerCase();
  const base = path.basename(filename);
  return (
    ALLOWED_ASSET_EXTS.has(ext) &&
    base === filename &&
    !filename.includes('..') &&
    !filename.includes('/')
  );
}
