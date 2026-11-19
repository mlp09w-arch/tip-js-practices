const priorities = new Set(["low", "medium", "high"]);

export function validateTaskDraft(draft, tasks, editingId = null) {
  const rawId = typeof draft.id === "string" ? draft.id.trim() : draft.id;
  const id = editingId ?? (typeof rawId === "string" && /^\d+$/.test(rawId) ? Number(rawId) : rawId);
  const title = typeof draft.title === "string" ? draft.title.trim() : "";
  const priority = draft.priority;
  const errors = {};

  if (!Number.isSafeInteger(id) || id <= 0) {
    errors.id = "Введите положительное целое число.";
  } else {
    const exists = tasks.some((task) => task.id === id);
    if (editingId === null && exists) errors.id = "Такой номер уже используется.";
    if (editingId !== null && !exists) errors.id = "Задача не найдена.";
  }

  if (title.length < 1 || title.length > 100) errors.title = "Название должно содержать от 1 до 100 символов.";
  if (!priorities.has(priority)) errors.priority = "Выберите допустимый приоритет.";

  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, value: { id, title, priority } };
}
