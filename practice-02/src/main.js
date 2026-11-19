import assert from "node:assert/strict";
import { demoTasks, variantTasks, variantNumber } from "./data.js";
import { addTask, getPendingTasks, getTaskStats, renameTask, removeTask, setTaskCompleted } from "./task-service.js";

function printStats(label, tasks) {
  const { total, completed, pending, progress } = getTaskStats(tasks);
  console.log(`${label}: всего ${total}, выполнено ${completed}, осталось ${pending}, прогресс ${progress.toFixed(1)}%`);
}

function runScenario(title, initialTasks, steps) {
  console.log(`\n${title}`);
  const before = structuredClone(initialTasks);
  let tasks = initialTasks;
  printStats("Исходные данные", tasks);
  for (const [label, operation, expectedOk = true] of steps) {
    const result = operation(tasks);
    assert.equal(result.ok, expectedOk);
    if (result.ok) {
      tasks = result.tasks;
      printStats(label, tasks);
    } else {
      console.log(`${label}: ${result.error}`);
    }
  }
  console.table(tasks);
  assert.deepEqual(initialTasks, before);
  console.log("Невыполненные задачи:", getPendingTasks(tasks).map((task) => task.id));
  console.log("Исходный массив сохранён.");
}

runScenario("Общий набор", demoTasks, [
  ["Добавление № 20", (tasks) => addTask(tasks, 20, "Добавить проверку", "high")],
  ["Выполнение № 4", (tasks) => setTaskCompleted(tasks, 4, true)],
  ["Переименование № 10", (tasks) => renameTask(tasks, 10, "Подготовить инструкцию запуска")],
  ["Удаление № 7", (tasks) => removeTask(tasks, 7)],
  ["Обработка отсутствующего id", (tasks) => setTaskCompleted(tasks, 777, true), false],
]);

runScenario(`Вариант ${variantNumber}`, variantTasks, [
  ["Добавление № 80", (tasks) => addTask(tasks, 80, "Проверить загрузку релиза", "high")],
  ["Выполнение № 11", (tasks) => setTaskCompleted(tasks, 11, true)],
  ["Переименование № 23", (tasks) => renameTask(tasks, 23, "Опубликовать заметки к релизу")],
  ["Удаление № 37", (tasks) => removeTask(tasks, 37)],
  ["Обработка дубликата", (tasks) => addTask(tasks, 80, "Дубликат", "high"), false],
]);
