import TaskItem from "./TaskItem.jsx";

export default function TaskList({ tasks, categories, onToggle, onEdit, onDelete }) {
  const names = new Map(categories.map(({ id, name }) => [id, name]));
  return (
    <section aria-label="Список задач">
      <h2>Задачи</h2>
      <p>Найдено: {tasks.length}</p>
      {tasks.length ? (
        <ul>
          {tasks.map((task) => (
            <TaskItem key={task.id} task={task} categoryName={names.get(task.categoryId)}
              onToggle={onToggle} onEdit={onEdit} onDelete={onDelete} />
          ))}
        </ul>
      ) : <p>Список задач пуст</p>}
    </section>
  );
}
