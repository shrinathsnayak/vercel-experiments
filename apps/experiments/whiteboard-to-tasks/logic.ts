export const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

export type BoardTask = {
  title: string;
  owner?: string;
  priority: 'low' | 'medium' | 'high';
  dueHint?: string;
};

export function isImageFilename(name: string): boolean {
  return /\.(png|jpe?g|webp|gif)$/i.test(name);
}

export function clampTasks(tasks: BoardTask[]): BoardTask[] {
  return tasks.slice(0, 20).map((t) => ({
    title: t.title.trim().slice(0, 120),
    owner: t.owner?.trim().slice(0, 40) || undefined,
    priority: (['low', 'medium', 'high'].includes(t.priority) ? t.priority : 'medium') as BoardTask['priority'],
    dueHint: t.dueHint?.trim().slice(0, 40) || undefined,
  }));
}
