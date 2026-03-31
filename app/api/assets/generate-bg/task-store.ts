export type TaskStatus = 'pending' | 'running' | 'done' | 'error';

export interface Task {
  status: TaskStatus;
  result?: string;
  error?: string;
  createdAt: number;
}

const tasks = new Map<string, Task>();

export function createTask(taskId: string): Task {
  const task: Task = { status: 'pending', createdAt: Date.now() };
  tasks.set(taskId, task);
  return task;
}

export function getTask(taskId: string): Task | undefined {
  return tasks.get(taskId);
}
