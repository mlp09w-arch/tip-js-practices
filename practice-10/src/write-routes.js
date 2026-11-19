import { ApiError } from './errors.js';
import { jsonBody } from './json-body.js';
import { requireTask } from './task-resource.js';
import { validateTaskInput } from './task-validation.js';

export function registerWriteRoutes(router, store) {
  const readCategories = () => new Set(store.listCategories().map(({ id }) => id));
  const notFound = (id) => new ApiError(404, 'TASK_NOT_FOUND', 'Задача не найдена.', { id });

  router.post('/tasks', ...jsonBody, (req, res) => {
    const value = validateTaskInput(req.body, { categoryIds: readCategories() });
    const data = store.createTask(value);
    res.location(`/api/tasks/${data.id}`).status(201).json({ data });
  });

  router.patch('/tasks/:id', requireTask(store), ...jsonBody, (req, res) => {
    const { id } = req.task;
    const changes = validateTaskInput(req.body, { partial: true, categoryIds: readCategories() });
    const data = store.updateTask(id, changes);
    if (!data) throw notFound(id);
    res.json({ data });
  });

  router.delete('/tasks/:id', requireTask(store), (req, res) => {
    const { id } = req.task;
    if (!store.deleteTask(id)) throw notFound(id);
    res.status(204).end();
  });
}
