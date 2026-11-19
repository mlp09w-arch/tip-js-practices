"use strict";

const totalTasks = 10;
const completedTasks = 7;
const dailyLimit = 3;

if (!Number.isInteger(totalTasks) || totalTasks < 0 || totalTasks > 1000) {
  console.log("Ошибка: всего задач должно быть целым числом от 0 до 1000.");
} else if (!Number.isInteger(completedTasks) || completedTasks < 0 || completedTasks > totalTasks) {
  console.log("Ошибка: выполнено задач должно быть целым числом от 0 до общего количества.");
} else if (!Number.isInteger(dailyLimit) || dailyLimit < 1 || dailyLimit > 1000) {
  console.log("Ошибка: дневная норма должна быть целым числом от 1 до 1000.");
} else {
  let remainingTasks = totalTasks - completedTasks;
  let days = 0;

  if (remainingTasks === 0) {
    console.log("Оставшихся задач нет.");
  } else {
    console.log(`Осталось задач: ${remainingTasks}`);
  }

  while (remainingTasks > 0) {
    days += 1;
    const completedToday = Math.min(dailyLimit, remainingTasks);
    remainingTasks -= completedToday;
    console.log(`День ${days}: выполнено ${completedToday}, осталось ${remainingTasks}`);
  }

  console.log(`Потребуется дней: ${days}`);
}
