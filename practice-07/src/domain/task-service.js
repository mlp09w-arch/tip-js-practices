const priorities = new Set(["low", "medium", "high"]);

export function validateTaskDraft(draft, categories) {
  const title = typeof draft?.title === "string" ? draft.title.trim() : "";
  const priority = draft?.priority;
  const rawCategory = draft?.categoryId;
  const categoryId = typeof rawCategory === "string" && /^\d+$/.test(rawCategory)
    ? Number(rawCategory) : rawCategory;
  const errors = {};
  if (title.length < 1 || title.length > 100) errors.title = "Название должно содержать от 1 до 100 символов.";
  if (!priorities.has(priority)) errors.priority = "Выберите допустимый приоритет.";
  if (!categories.some((category) => category.id === categoryId)) errors.categoryId = "Выберите существующую категорию.";
  return { valid: Object.keys(errors).length === 0, value: { title, priority, categoryId }, errors };
}

export function selectTasks(tasks, filters) {
  const q = filters.q.trim().toLowerCase();
  return tasks.filter((task) =>
    (!q || task.title.toLowerCase().includes(q))
    && (!filters.completed || String(task.completed) === filters.completed)
    && (!filters.priority || task.priority === filters.priority)
    && (!filters.categoryId || String(task.categoryId) === filters.categoryId));
}

export function getTaskStats(tasks) {
  const total = tasks.length;
  const completed = tasks.filter((task) => task.completed).length;
  return { total, completed, active: total - completed };
}

export function addTask(tasks, { title, priority, categoryId }, id) {
  if (!Number.isSafeInteger(id) || id <= 0 || tasks.some((task) => task.id === id)) {
    throw new RangeError("Некорректный или занятый id.");
  }
  return [...tasks, { id, title, priority, categoryId, completed: false }];
}

export function updateTask(tasks, id, { title, priority, categoryId }) {
  return tasks.map((task) => task.id === id ? { ...task, title, priority, categoryId } : task);
}

export function toggleTask(tasks, id) {
  return tasks.map((task) => task.id === id ? { ...task, completed: !task.completed } : task);
}

export function removeTask(tasks, id) {
  return tasks.filter((task) => task.id !== id);
}
