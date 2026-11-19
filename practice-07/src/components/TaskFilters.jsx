export default function TaskFilters({ filters, categories, onChange }) {
  const change = (event) => {
    const { name, value } = event.target;
    onChange({ ...filters, [name]: value });
  };

  return (
    <section aria-label="Фильтры">
      <h2>Фильтры</h2>
      <label>Поиск <input name="q" value={filters.q} onChange={change} /></label>
      <label>Статус
        <select name="completed" value={filters.completed} onChange={change}>
          <option value="">Все</option><option value="false">В работе</option><option value="true">Выполнены</option>
        </select>
      </label>
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
