export type TaskStatus = 'pending' | 'running' | 'done' | 'error';

export interface Task {
  status: TaskStatus;
  result?: string;
  error?: string;
  createdAt: number;
}

const tasks = new Map<string, Task>();
const TASK_TTL_MS = 10 * 60 * 1000; // 10 minutes

function pruneExpiredTasks() {
  const now = Date.now();
  for (const [id, task] of tasks) {
    if ((task.status === 'done' || task.status === 'error') && now - task.createdAt > TASK_TTL_MS) {
      tasks.delete(id);
    }
  }
}

export function createTask(taskId: string): Task {
  pruneExpiredTasks();
  const task: Task = { status: 'pending', createdAt: Date.now() };
  tasks.set(taskId, task);
  return task;
}

export function getTask(taskId: string): Task | undefined {
  return tasks.get(taskId);
}
