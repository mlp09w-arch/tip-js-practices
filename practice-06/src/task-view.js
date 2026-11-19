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

export function createTaskElement(task, category) {
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
  actions.append(toggle, createAction("edit", "Изменить"), createAction("delete", "Удалить"));

  const categoryLabel = makeElement("span", "task-category", category?.name ?? "Без категории");
  card.append(title, id, status, priority, categoryLabel, actions);
  return card;
}

export function renderTaskList(listElement, tasks, categories) {
  const byId = new Map(categories.map((category) => [category.id, category]));
  listElement.replaceChildren(...tasks.map((task) => createTaskElement(task, byId.get(task.categoryId))));
}
