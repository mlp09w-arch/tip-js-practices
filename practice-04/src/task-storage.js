export const STORAGE_VERSION = 1;
const priorities = new Set(["low", "medium", "high"]);

export function isValidTaskList(value) {
  if (!Array.isArray(value)) return false;
  const ids = new Set();
  for (const task of value) {
    if (!task || !Number.isSafeInteger(task.id) || task.id <= 0 || ids.has(task.id)
      || typeof task.title !== "string" || !task.title.trim() || task.title.length > 100
      || typeof task.completed !== "boolean" || !priorities.has(task.priority)) return false;
    ids.add(task.id);
  }
  return true;
}

export function loadTasks(storage, key, fallbackTasks) {
  try {
    const text = storage.getItem(key);
    if (text === null) return { ok: true, source: "initial", tasks: fallbackTasks.map((task) => ({ ...task })) };
    const data = JSON.parse(text);
    if (data?.version !== STORAGE_VERSION || !isValidTaskList(data.tasks)) {
      throw new Error("Некорректная версия или формат задач.");
    }
    return { ok: true, source: "storage", tasks: data.tasks };
  } catch {
    return {
      ok: false,
      source: "fallback",
      tasks: fallbackTasks.map((task) => ({ ...task })),
      error: "Не удалось восстановить данные из localStorage.",
    };
  }
}

export function saveTasks(storage, key, tasks) {
  if (!isValidTaskList(tasks)) return { ok: false, error: "Некорректный список задач." };
  try {
    storage.setItem(key, JSON.stringify({ version: STORAGE_VERSION, tasks }));
    return { ok: true };
  } catch {
    return { ok: false, error: "Не удалось сохранить данные в localStorage." };
  }
}

export function removeSavedTasks(storage, key) {
  try {
    storage.removeItem(key);
    return { ok: true };
  } catch {
    return { ok: false, error: "Не удалось удалить сохранённые данные." };
  }
}
