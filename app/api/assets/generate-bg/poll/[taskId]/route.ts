import { NextResponse } from 'next/server';
import { getTask } from '../../task-store';

export async function GET(_req: Request, { params }: { params: Promise<{ taskId: string }> }) {
  const { taskId } = await params;
  const task = getTask(taskId);
  if (!task) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 });
  }
  return NextResponse.json({
    status: task.status,
    result: task.result,
    error: task.error,
  });
}
