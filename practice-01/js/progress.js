"use strict";

function showProgress(totalTasks, completedTasks) {
  if (!Number.isInteger(totalTasks) || totalTasks < 0 || totalTasks > 1000) {
    console.log("Ошибка: всего задач должно быть целым числом от 0 до 1000.");
    return;
  }

  if (!Number.isInteger(completedTasks) || completedTasks < 0 || completedTasks > totalTasks) {
    console.log("Ошибка: выполнено задач должно быть целым числом от 0 до общего количества.");
    return;
  }

  if (totalTasks === 0) {
    console.log("Задач пока нет");
    return;
  }

  const remainingTasks = totalTasks - completedTasks;
  const progress = (completedTasks / totalTasks * 100).toFixed(1);
  let status = "В работе";

  if (completedTasks === 0) {
    status = "Не начато";
  } else if (remainingTasks === 0) {
    status = "Завершено";
  }

  console.log(`Всего задач: ${totalTasks}`);
  console.log(`Выполнено: ${completedTasks}`);
  console.log(`Осталось: ${remainingTasks}`);
  console.log(`Прогресс: ${progress}%`);
  console.log(`Статус: ${status}`);
}

if (typeof module === "object") {
  module.exports = { showProgress };
  if (require.main === module) showProgress(10, 7);
} else {
  showProgress(10, 7);
}
