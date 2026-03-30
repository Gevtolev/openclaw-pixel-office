import fs from 'fs';
import path from 'path';
import { getOpenClawHome } from './openclaw-paths';

const REDACTION_PATTERNS = [
  { regex: /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, replace: '[IP]' },
  { regex: /[\w.-]+@[\w.-]+\.\w+/g, replace: '[EMAIL]' },
  { regex: /1[3-9]\d{9}/g, replace: '[PHONE]' },
  { regex: /\/[\w/.-]{10,}/g, replace: '[PATH]' },
  { regex: /o[A-Za-z0-9_-]{20,}/g, replace: '[OPENID]' },
];

export function redactSensitive(text: string): string {
  let result = text;
  for (const { regex, replace } of REDACTION_PATTERNS) {
    result = result.replace(regex, replace);
  }
  return result;
}

export function getYesterdayMemo(): string | null {
  const memoryDir = path.join(getOpenClawHome(), '..', 'memory');

  if (!fs.existsSync(memoryDir)) return null;

  const files = fs.readdirSync(memoryDir).filter((f) => f.endsWith('.md'));
  if (files.length === 0) return null;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const dateStr = yesterday.toISOString().slice(0, 10);

  const target = files.find((f) => f.includes(dateStr)) || files[files.length - 1];
  const content = fs.readFileSync(path.join(memoryDir, target), 'utf-8');

  return redactSensitive(content.slice(0, 500));
}
