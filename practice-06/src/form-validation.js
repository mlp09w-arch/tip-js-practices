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
