const statuses = [
  { value: "", label: "Все" },
  { value: "false", label: "В работе" },
  { value: "true", label: "Завершенные" },
];

export default function TaskFilters({ filters, categories, onChange }) {
  const change = (event) => {
    const { name, value } = event.target;
    onChange({ ...filters, [name]: value });
  };

  return (
    <section aria-label="Фильтры">
      <h2>Фильтры</h2>
      <label>Поиск <input name="q" value={filters.q} onChange={change} /></label>
      <div className="status-filters" role="group" aria-label="Статус">
        {statuses.map(({ value, label }) => (
          <button key={value} type="button" aria-pressed={filters.completed === value}
            onClick={() => onChange({ ...filters, completed: value })}>
            {label}
          </button>
        ))}
      </div>
      <label>Приоритет
        <select name="priority" value={filters.priority} onChange={change}>
          <option value="">Все</option><option value="low">Низкий</option>
          <option value="medium">Средний</option><option value="high">Высокий</option>
        </select>
      </label>
      <label>Категория
        <select name="categoryId" value={filters.categoryId} onChange={change}>
          <option value="">Все</option>
          {categories.map(({ id, name }) => <option key={id} value={id}>{name}</option>)}
        </select>
      </label>
      <button type="button" onClick={() => onChange({ q: "", completed: "", priority: "", categoryId: "" })}>
        Сбросить фильтры
      </button>
    </section>
  );
}
