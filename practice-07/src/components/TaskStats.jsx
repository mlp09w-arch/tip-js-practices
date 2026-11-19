export default function TaskStats({ stats }) {
  return (
    <section aria-label="Статистика">
      <h2>Статистика</h2>
      <dl>
        <dt>Всего</dt><dd>{stats.total}</dd>
        <dt>Выполнено</dt><dd>{stats.completed}</dd>
        <dt>В работе</dt><dd>{stats.active}</dd>
      </dl>
    </section>
  );
}
