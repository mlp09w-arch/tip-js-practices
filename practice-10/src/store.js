import { categories as seedCategories, tasks as seedTasks } from './data.js';
import { selectTasks, findTask } from './task-service.js';
const noFilters = { completed: null, priority: null, categoryId: null, q: '' };

export function createStore() {
  let tasks;
  let nextId;
  const categories = seedCategories.map(item => ({ ...item }));
  function reset() {
    tasks = seedTasks.map(item => ({ ...item }));
    nextId = Math.max(0, ...tasks.map(item => item.id)) + 1;
    return { reset: true, total: tasks.length };
  }
  reset();
  return {
    listTasks: (filters = noFilters) => selectTasks(tasks, filters).map(item => ({ ...item })),
    getTask: id => { const task = findTask(tasks, id); return task ? { ...task } : null; },
    listCategories: () => categories.map(item => ({ ...item })),
    reset,
    createTask({ title, priority, categoryId }) {
      const task = { id: nextId, title, priority, categoryId, completed: false };
      nextId += 1;
      tasks.push(task);
      return { ...task };
    },
    updateTask(id, changes) {
      const index = tasks.findIndex(task => task.id === id);
      if (index < 0) return null;
      const task = { ...tasks[index] };
      for (const key of ['title', 'priority', 'categoryId', 'completed']) {
        if (Object.hasOwn(changes, key)) task[key] = changes[key];
      }
      tasks[index] = task;
      return { ...task };
    },
    deleteTask(id) {
      const index = tasks.findIndex(task => task.id === id);
      if (index < 0) return false;
      tasks.splice(index, 1);
      return true;
    },
  };
}
