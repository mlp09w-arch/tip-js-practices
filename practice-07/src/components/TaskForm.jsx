import { useState } from "react";
import { validateTaskDraft } from "../domain/task-service.js";

export default function TaskForm({ categories, initialTask, onSave, onCancel }) {
  const createDraft = () => ({
    title: initialTask?.title ?? "",
    priority: initialTask?.priority ?? "medium",
    categoryId: String(initialTask?.categoryId ?? categories[0]?.id ?? ""),
  });
  const [draft, setDraft] = useState(createDraft);
  const [errors, setErrors] = useState({});
  const [failure, setFailure] = useState("");
  const change = ({ target: { name, value } }) => {
    setDraft((previous) => ({ ...previous, [name]: value }));
    setErrors((previous) => ({ ...previous, [name]: "" }));
    setFailure("");
  };

  function submit(event) {
    event.preventDefault();
    const result = validateTaskDraft(draft, categories);
    setErrors(result.errors);
    setFailure("");
    if (!result.valid) return;
    if (onSave(result.value)) setDraft(createDraft());
    else setFailure("Сохранить задачу не удалось.");
  }

  return (
    <section aria-labelledby="editor-heading">
      <h2 id="editor-heading">{initialTask ? "Редактирование задачи" : "Добавление задачи"}</h2>
      <form noValidate onSubmit={submit}>
        <label htmlFor="task-title">Название</label>
        <input id="task-title" name="title" value={draft.title} onChange={change}
          aria-invalid={Boolean(errors.title)} aria-describedby="title-error" />
        <div className="error" id="title-error">{errors.title}</div>
        <label htmlFor="task-priority">Приоритет</label>
        <select id="task-priority" name="priority" value={draft.priority} onChange={change}
          aria-invalid={Boolean(errors.priority)} aria-describedby="priority-error">
          <option value="low">Низкий</option><option value="medium">Средний</option><option value="high">Высокий</option>
        </select>
        <div className="error" id="priority-error">{errors.priority}</div>
        <label htmlFor="task-category">Категория</label>
        <select id="task-category" name="categoryId" value={draft.categoryId} onChange={change}
          aria-invalid={Boolean(errors.categoryId)} aria-describedby="category-error">
          <option value="">Выберите категорию</option>
          {categories.map(({ id, name }) => <option key={id} value={id}>{name}</option>)}
        </select>
        <div className="error" id="category-error">{errors.categoryId}</div>
        {failure && <p role="alert">{failure}</p>}
        <button type="submit">{initialTask ? "Сохранить изменения" : "Добавить задачу"}</button>
        {initialTask && <button type="button" onClick={onCancel}>Отмена</button>}
      </form>
    </section>
  );
}
