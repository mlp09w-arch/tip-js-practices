import { demoTasks } from "./data.js";
import { getPendingTasks, setTaskCompleted } from "./task-service.js";

// КР1, задание 2.
console.log("demoTasks →", getPendingTasks(demoTasks).map((task) => task.id));
console.log("[] →", getPendingTasks([]));

// КР1, задание 3. Оба вызова работают с исходным набором.
const result = setTaskCompleted(demoTasks, 4, true);
console.log("id = 4, исходный статус:", demoTasks.find((task) => task.id === 4).completed);
if (result.ok) {
  console.log("id = 4, новый статус:", result.tasks.find((task) => task.id === 4).completed);
} else {
  console.log("Ошибка:", result.error);
}

const missing = setTaskCompleted(demoTasks, 777, true);
console.log("id = 777:", missing);
