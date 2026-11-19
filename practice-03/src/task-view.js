import { getTaskStats } from "./task-service.js";

const priorityLabels = { low: "Низкий", medium: "Средний", high: "Высокий" };

function makeElement(tag, className, text = "") {
  const element = document.createElement(tag);
  element.className = className;
  element.textContent = text;
  return element;
}

function createAction(action, label) {
  const button = document.createElement("button");
  button.type = "button";
  button.dataset.action = action;
  button.append(makeElement("span", "action-label", label));
  return button;
}

export function createTaskElement(task) {
  const card = makeElement("li", "task-card");
  card.dataset.taskId = String(task.id);
  card.classList.toggle("is-completed", task.completed);

  const title = makeElement("h3", "task-title", task.title);
  const id = makeElement("span", "task-number", `№ ${task.id}`);
  const status = makeElement("span", "task-status", task.completed ? "Выполнена" : "В работе");
  const priority = makeElement("span", "task-priority", priorityLabels[task.priority]);
  const actions = makeElement("div", "task-actions");
  const toggle = createAction("toggle", "Выполнена");
  toggle.setAttribute("aria-pressed", String(task.completed));
  actions.append(toggle, createAction("delete", "Удалить"));

  card.append(title, id, status, priority, actions);
  return card;
}

export function renderTaskList(listElement, tasks) {
  listElement.replaceChildren(...tasks.map(createTaskElement));
}

export function renderSummary(summaryElement, tasks, visibleCount) {
  const { total, completed, pending, progress } = getTaskStats(tasks);
  const values = { total, completed, pending, progress: `${progress.toFixed(1)}%`, visible: visibleCount };

  for (const [key, value] of Object.entries(values)) {
    summaryElement.querySelector(`[data-stat="${key}"]`).textContent = String(value);
  }
}

export function renderEmptyState(messageElement, total, visibleCount) {
  messageElement.hidden = visibleCount > 0;
  if (total === 0) {
    messageElement.textContent = "Список задач пуст.";
  } else {
    messageElement.textContent = visibleCount === 0 ? "Нет задач по выбранному фильтру." : "";
  }
}
