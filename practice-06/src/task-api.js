import { ApiError } from "./api-client.js";

const ALLOWED_PRIORITIES = new Set(["low", "medium", "high"]);
const ALLOWED_FILTERS = new Set(["completed", "priority", "categoryId", "q"]);

function invalidResponse(message) {
  return new ApiError(message, { kind: "invalid-response" });
}

function isPositiveSafeInteger(value) {
  return Number.isSafeInteger(value) && value > 0;
}

export function isTask(value) {
  return Boolean(
    value
    && typeof value === "object"
    && isPositiveSafeInteger(value.id)
    && typeof value.title === "string"
    && value.title.trim().length >= 1
    && value.title.trim().length <= 100
    && typeof value.completed === "boolean"
    && ALLOWED_PRIORITIES.has(value.priority)
    && isPositiveSafeInteger(value.categoryId),
  );
}

export function isCategory(value) {
  return Boolean(
    value
    && typeof value === "object"
    && isPositiveSafeInteger(value.id)
    && typeof value.name === "string"
    && value.name.trim().length >= 1
    && value.name.trim().length <= 100,
  );
}

function normalizeFilters(filters) {
  if (!filters || typeof filters !== "object" || Array.isArray(filters)) {
    throw new TypeError("Фильтры должны быть объектом.");
  }
  const query = {};
  for (const [key, value] of Object.entries(filters)) {
    if (!ALLOWED_FILTERS.has(key)) throw new TypeError(`Неизвестный фильтр ${key}.`);
    if (value === undefined) continue;
    if (key === "completed" && typeof value !== "boolean"
      || key === "priority" && !ALLOWED_PRIORITIES.has(value)
      || key === "categoryId" && !isPositiveSafeInteger(value)
      || key === "q" && (typeof value !== "string" || value.trim().length > 100)) {
      throw new TypeError(`Недопустимое значение фильтра ${key}.`);
    }
    if (key !== "q" || value.trim()) query[key] = key === "q" ? value.trim() : value;
  }
  return query;
}

function readCollection(payload, validator) {
  const items = payload?.data;
  if (!Array.isArray(items) || !items.every(validator)
    || new Set(items.map((item) => item.id)).size !== items.length
    || items.length !== payload.meta?.total) {
    throw invalidResponse("Сервер вернул некорректную коллекцию.");
  }
  return items;
}

export function createTaskApi(client) {
  if (typeof client?.requestJson !== "function") throw new TypeError("Требуется клиент API.");

  async function getTasks(filters = {}, { signal } = {}) {
    const result = await client.requestJson("/tasks", { query: normalizeFilters(filters), signal });
    const tasks = readCollection(result, isTask);
    if (!result.meta.filters || typeof result.meta.filters !== "object" || Array.isArray(result.meta.filters)) {
      throw invalidResponse("Сервер вернул некорректные фильтры.");
    }
    return { tasks, meta: result.meta };
  }

  async function getTaskById(id, { signal } = {}) {
    if (!isPositiveSafeInteger(id)) throw new TypeError("Некорректный id задачи.");
    const result = await client.requestJson(`/tasks/${id}`, { signal });
    if (!isTask(result?.data) || result.data.id !== id) throw invalidResponse("Некорректная задача.");
    return result.data;
  }

  async function getCategories({ signal } = {}) {
    return readCollection(await client.requestJson("/categories", { signal }), isCategory);
  }

  async function loadInitialData(filters, options) {
    const [{ tasks, meta }, categories] = await Promise.all([getTasks(filters, options), getCategories(options)]);
    return { tasks, categories, meta };
  }

  async function createTask(draft, { signal } = {}) {
    const result = await client.requestJson("/tasks", { method: "POST", body: draft, signal });
    if (!isTask(result?.data)) throw invalidResponse("Некорректная созданная задача.");
    return result.data;
  }

  async function updateTask(id, changes, { signal } = {}) {
    if (!isPositiveSafeInteger(id)) throw new TypeError("Некорректный id задачи.");
    const result = await client.requestJson(`/tasks/${id}`, { method: "PATCH", body: changes, signal });
    if (!isTask(result?.data) || result.data.id !== id) throw invalidResponse("Некорректная обновлённая задача.");
    return result.data;
  }

  function setTaskCompleted(id, completed, options) {
    return updateTask(id, { completed }, options);
  }

  async function deleteTask(id, { signal } = {}) {
    if (!isPositiveSafeInteger(id)) throw new TypeError("Некорректный id задачи.");
    const result = await client.requestJson(`/tasks/${id}`, { method: "DELETE", signal });
    if (result !== null) throw invalidResponse("Удаление должно вернуть пустой ответ.");
    return null;
  }

  async function resetDemoData({ signal } = {}) {
    const result = await client.requestJson("/debug/reset", { method: "POST", signal });
    if (result?.data?.reset !== true || !Number.isSafeInteger(result.data.total) || result.data.total < 0) {
      throw invalidResponse("Некорректный результат сброса.");
    }
    return result.data;
  }

  return { getTasks, getTaskById, getCategories, loadInitialData, createTask, updateTask, setTaskCompleted, deleteTask, resetDemoData };
}
