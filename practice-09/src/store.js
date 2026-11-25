import { categories as seedCategories, tasks as seedTasks } from './data.js';
import { selectTasks, findTask } from './task-service.js';

// Для каждого приложения собственные копии данных, без открытия порта.
export function createStore() {
  const tasks = seedTasks.map(task => ({ ...task }));
  const categories = seedCategories.map(category => ({ ...category }));
  let nextId = tasks.reduce((max, task) => Math.max(max, task.id), 0) + 1;
  return {
    listTasks: filters => selectTasks(tasks, filters),
    getTask: id => findTask(tasks, id),
    listCategories: () => categories.map(category => ({ ...category })),
    createTask(draft) {
      const task = { ...draft, id: nextId++, completed: false };
      tasks.push(task);
      return { ...task };
    },
  };
}
