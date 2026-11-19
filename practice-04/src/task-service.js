const priorities = ["low", "medium", "high"];

function isValidId(id) {
  return Number.isSafeInteger(id) && id > 0;
}

function normalizeTitle(title) {
  if (typeof title !== "string") return null;
  const trimmed = title.trim();
  return trimmed.length >= 1 && trimmed.length <= 100 ? trimmed : null;
}

export function createTask(id, title, priority = "medium") {
  if (!isValidId(id)) return { ok: false, error: "Некорректный id." };

  const normalizedTitle = normalizeTitle(title);
  if (normalizedTitle === null) {
    return { ok: false, error: "Название должно содержать от 1 до 100 символов." };
  }
  if (!priorities.includes(priority)) {
    return { ok: false, error: "Неизвестный приоритет." };
  }

  return { ok: true, task: { id, title: normalizedTitle, completed: false, priority } };
}

export function findTaskById(tasks, id) {
  return tasks.find((task) => task.id === id);
}

export function getPendingTasks(tasks) {
  return tasks.filter((task) => task.completed === false);
}

export function getTaskTitles(tasks) {
  return tasks.map((task) => task.title);
}

export function getTaskStats(tasks) {
  const total = tasks.length;
  const completed = tasks.filter((task) => task.completed === true).length;
  return {
    total,
    completed,
    pending: total - completed,
    progress: total === 0 ? 0 : completed / total * 100,
  };
}

export function addTask(tasks, id, title, priority = "medium") {
  const result = createTask(id, title, priority);
  if (!result.ok) return result;
  if (findTaskById(tasks, id)) return { ok: false, error: `Задача с id ${id} уже есть.` };
  return { ok: true, tasks: [...tasks, result.task] };
}

export function setTaskCompleted(tasks, id, completed) {
  if (!Array.isArray(tasks)) return { ok: false, error: "Ожидается массив задач." };
  if (!isValidId(id)) return { ok: false, error: "Некорректный id." };
  if (typeof completed !== "boolean") {
    return { ok: false, error: "Статус должен быть true или false." };
  }
  const index = tasks.findIndex((task) => task?.id === id);
  if (index === -1) return { ok: false, error: `Задача с id ${id} не найдена.` };

  const updatedTasks = tasks.slice();
  updatedTasks[index] = { ...tasks[index], completed };
  return { ok: true, tasks: updatedTasks };
}

export function renameTask(tasks, id, title) {
  if (!isValidId(id)) return { ok: false, error: "Некорректный id." };
  const normalizedTitle = normalizeTitle(title);
  if (normalizedTitle === null) {
    return { ok: false, error: "Название должно содержать от 1 до 100 символов." };
  }

  const task = findTaskById(tasks, id);
  if (!task) return { ok: false, error: `Задача с id ${id} не найдена.` };
  return { ok: true, tasks: tasks.map((item) => item === task ? { ...item, title: normalizedTitle } : item) };
}

export function removeTask(tasks, id) {
  if (!isValidId(id)) return { ok: false, error: "Некорректный id." };
  if (!findTaskById(tasks, id)) return { ok: false, error: `Задача с id ${id} не найдена.` };
  return { ok: true, tasks: tasks.filter((task) => task.id !== id) };
}

export function updateTask(tasks, id, title, priority) {
  const result = createTask(id, title, priority);
  if (!result.ok) return result;
  const task = findTaskById(tasks, id);
  if (!task) return { ok: false, error: `Задача с id ${id} не найдена.` };
  const changes = { title: result.task.title, priority: result.task.priority };
  return { ok: true, tasks: tasks.map((item) => item === task ? { ...item, ...changes } : item) };
}
