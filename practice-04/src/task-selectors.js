import { getPendingTasks } from "./task-service.js";

export function getVisibleTasks(tasks, filter = "all") {
  if (filter === "pending") return getPendingTasks(tasks);
  if (filter === "completed") return tasks.filter((task) => task.completed === true);
  return tasks.slice();
}
