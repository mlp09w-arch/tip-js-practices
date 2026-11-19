import { useState } from "react";
import { tasks as initialTasks, categories } from "./data.js";
import { createInitialFilters } from "./variant.js";
import { addTask, getTaskStats, removeTask, selectTasks, toggleTask, updateTask } from "./domain/task-service.js";
import TaskForm from "./components/TaskForm.jsx";
import TaskFilters from "./components/TaskFilters.jsx";
import TaskList from "./components/TaskList.jsx";
import TaskStats from "./components/TaskStats.jsx";

export default function App() {
  const [tasks, setTasks] = useState(initialTasks);
  const [filters, setFilters] = useState(createInitialFilters);
  const [editingId, setEditingId] = useState(null);
  const [notice, setNotice] = useState("");
  const editingTask = tasks.find((task) => task.id === editingId) ?? null;

  function save(value) {
    if (editingId !== null && !editingTask) return false;
    if (editingTask) {
      setTasks((previous) => updateTask(previous, editingId, value));
      setEditingId(null);
      setNotice("Задача изменена.");
    } else {
      setTasks((previous) => {
        const id = previous.reduce((max, task) => Math.max(max, task.id), 0) + 1;
        return addTask(previous, value, id);
      });
      setNotice("Задача добавлена.");
    }
    return true;
  }

  function toggle(id) {
    setTasks((previous) => toggleTask(previous, id));
    setNotice("Статус изменён.");
  }

  function remove(id) {
    const task = tasks.find((entry) => entry.id === id);
    if (!task || !window.confirm(`Удалить «${task.title}»?`)) return;
    setTasks((previous) => removeTask(previous, id));
    if (editingId === id) setEditingId(null);
    setNotice("Задача удалена.");
  }

  return (
    <main>
      <h1>Задачи на React</h1>
      <p>Изменения хранятся до перезагрузки страницы.</p>
      <p role="status">{notice}</p>
      <TaskStats stats={getTaskStats(tasks)} />
      <TaskFilters filters={filters} categories={categories} onChange={setFilters} />
      <TaskForm key={editingId ?? "new"} categories={categories} initialTask={editingTask}
        onSave={save} onCancel={() => setEditingId(null)} />
      <TaskList tasks={selectTasks(tasks, filters)} categories={categories}
        onToggle={toggle} onEdit={setEditingId} onDelete={remove} />
    </main>
  );
}
