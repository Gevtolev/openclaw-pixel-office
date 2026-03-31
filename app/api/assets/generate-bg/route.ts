import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { PIXEL_OFFICE_DIR, BG_HISTORY_DIR, ensureAssetDirs, checkPassword } from '@/lib/asset-utils';
import { createTask, getTask } from './task-store';

function readGeminiKey(): string {
  const configFile = path.join(PIXEL_OFFICE_DIR, 'gemini.json');
  if (!fs.existsSync(configFile)) return '';
  try {
    const raw = fs.readFileSync(configFile, 'utf-8');
    return JSON.parse(raw).apiKey || '';
  } catch {
    return '';
  }
}

async function runGeneration(taskId: string, prompt: string): Promise<void> {
  const task = getTask(taskId)!;
  task.status = 'running';

  const apiKey = readGeminiKey();
  if (!apiKey) {
    task.status = 'error';
    task.error = 'Gemini API key not configured';
    return;
  }

  try {
    ensureAssetDirs();
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp-image-generation' });

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { responseModalities: ['image', 'text'] } as any,
    });

    const parts = result.response.candidates?.[0]?.content?.parts || [];
    const imagePart = parts.find((p: any) => p.inlineData);

    if (!imagePart?.inlineData) {
      task.status = 'error';
      task.error = 'No image returned by Gemini';
      return;
    }

    const filename = `bg-${taskId}.png`;
    const destPath = path.join(BG_HISTORY_DIR, filename);
    fs.writeFileSync(destPath, Buffer.from(imagePart.inlineData.data, 'base64'));

    task.status = 'done';
    task.result = filename;
  } catch (e: any) {
    task.status = 'error';
    task.error = e.message;
  }
}

export async function POST(req: Request) {
  const password = req.headers.get('x-asset-pass') || '';
  if (!checkPassword(password)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { prompt } = await req.json();
    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'prompt is required' }, { status: 400 });
    }

    const taskId = crypto.randomUUID();
    createTask(taskId);

    runGeneration(taskId, prompt).catch(() => {});

    return NextResponse.json({ taskId });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
