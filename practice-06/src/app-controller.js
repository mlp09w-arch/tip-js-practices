import { ApiError } from "./api-client.js";
import { validateTaskDraft } from "./form-validation.js";

export function messageForError(error) {
  if (!(error instanceof ApiError)) return "Не удалось выполнить операцию.";
  if (error.kind === "timeout") return "Сервер не ответил вовремя. Попробуйте ещё раз.";
  if (error.kind === "network") return "Нет соединения с учебным API. Проверьте, запущен ли npm start.";
  if (error.kind === "invalid-response") return "Сервер вернул ответ неожиданного формата.";
  if (error.kind === "http" && error.status === 404) return "Запись уже отсутствует на сервере. Обновите список.";
  if (error.kind === "http") return error.message || `Сервер вернул ошибку ${error.status}.`;
  return "Не удалось выполнить операцию.";
}

export function createAppController({ api, view, validateDraft = validateTaskDraft } = {}) {
  const apiMethods = ["loadInitialData", "getTasks", "createTask", "updateTask", "setTaskCompleted", "deleteTask", "resetDemoData"];
  const viewMethods = ["setListState", "setTasks", "setCategories", "setTotal", "setFormTask", "showFormErrors", "setMutationPending", "notify"];
  if (typeof validateDraft !== "function" || apiMethods.some((key) => typeof api?.[key] !== "function")
    || viewMethods.some((key) => typeof view?.[key] !== "function")) {
    throw new TypeError("Нужны API, адаптер интерфейса и функция валидации.");
  }

  let tasks = [];
  let categories;
  let filters = {};
  let editingId = null;
  let activeLoad;
  let activeMutation;
  let destroyed = false;

  async function refresh() {
    if (destroyed) return;
    activeLoad?.abort();
    const controller = new AbortController();
    activeLoad = controller;
    const { signal } = controller;
    view.setListState("loading");
    try {
      const data = categories
        ? await api.getTasks(filters, { signal })
        : await api.loadInitialData(filters, { signal });
      if (signal.aborted || activeLoad !== controller) return;
      if (!categories) {
        categories = data.categories;
        view.setCategories(categories);
      }
      tasks = data.tasks;
      view.setTasks(tasks, categories);
      view.setMutationPending(Boolean(activeMutation));
      view.setTotal(data.meta.total);
      view.setListState(tasks.length ? "ready" : "empty");
    } catch (error) {
      if (!signal.aborted && activeLoad === controller && error.kind !== "aborted") {
        view.setListState("error", messageForError(error));
      }
    } finally {
      if (activeLoad === controller) activeLoad = undefined;
    }
  }

  function applyFilters(next = {}) {
    filters = { ...next };
    return refresh();
  }

  function cancelEdit() {
    editingId = null;
    view.showFormErrors({});
    view.setFormTask(null);
  }

  function beginEdit(id) {
    if (destroyed || activeMutation) return;
    const task = tasks.find((entry) => entry.id === id);
    if (!task) return;
    editingId = id;
    view.showFormErrors({});
    view.setFormTask(task);
  }

  async function mutate(operation, message, onSuccess) {
    if (destroyed || activeMutation) return;
    const controller = new AbortController();
    activeMutation = controller;
    view.setMutationPending(true);
    try {
      await operation({ signal: controller.signal });
      if (destroyed) return;
      onSuccess?.();
      view.notify(message, "success");
      await refresh();
    } catch (error) {
      if (!destroyed && error.kind !== "aborted") view.notify(messageForError(error), "error");
    } finally {
      activeMutation = undefined;
      if (!destroyed) view.setMutationPending(false);
    }
  }

  function submit(draft) {
    if (destroyed || activeMutation) return;
    const { valid, value, errors } = validateDraft(draft, categories ?? []);
    view.showFormErrors(errors);
    if (!valid) return;
    const id = editingId;
    return id === null
      ? mutate((options) => api.createTask(value, options), "Задача добавлена.", cancelEdit)
      : mutate((options) => api.updateTask(id, value, options), "Задача изменена.", cancelEdit);
  }

  function toggleTask(id) {
    const task = tasks.find((entry) => entry.id === id);
    if (task) return mutate((options) => api.setTaskCompleted(id, !task.completed, options), "Статус изменён.");
  }

  function deleteTask(id) {
    if (!tasks.some((entry) => entry.id === id)) return;
    return mutate((options) => api.deleteTask(id, options), "Задача удалена.", () => {
      if (editingId === id) cancelEdit();
    });
  }

  function resetData() {
    return mutate((options) => api.resetDemoData(options), "Исходные данные восстановлены.", cancelEdit);
  }

  function destroy() {
    destroyed = true;
    activeLoad?.abort();
    activeMutation?.abort();
  }

  return { start: applyFilters, applyFilters, refresh, submit, beginEdit, cancelEdit, toggleTask, deleteTask, resetData, destroy };
}
