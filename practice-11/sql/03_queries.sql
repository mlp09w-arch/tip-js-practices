-- Q1. Все задачи с названием категории.
SELECT t.id, t.title, t.completed, t.priority, t.category_id, c.name AS category_name
FROM public.tasks AS t
JOIN public.categories AS c ON c.id = t.category_id
ORDER BY t.id;

-- Q2. Невыполненные задачи высокого приоритета категории 2.
SELECT id, title, completed, priority, category_id
FROM public.tasks
WHERE NOT completed AND priority = 'high' AND category_id = 2
ORDER BY id;

-- Q3. Поиск по названию без учёта регистра.
SELECT id, title, completed, priority, category_id
FROM public.tasks
WHERE title ILIKE '%ПРОВЕР%'
ORDER BY id;

-- Q4. Количество задач по категориям.
SELECT c.id, c.name, count(t.id) AS task_count
FROM public.categories AS c
LEFT JOIN public.tasks AS t ON t.category_id = c.id
GROUP BY c.id, c.name
ORDER BY c.id;

-- Q5. Выполненные и невыполненные задачи в каждой категории.
SELECT c.id, c.name,
       count(t.id) FILTER (WHERE t.completed) AS completed_count,
       count(t.id) FILTER (WHERE NOT t.completed) AS pending_count
FROM public.categories AS c
LEFT JOIN public.tasks AS t ON t.category_id = c.id
GROUP BY c.id, c.name
ORDER BY c.id;

-- Q6. Категории, в которых не менее четырёх задач.
SELECT c.id, c.name, count(t.id) AS task_count
FROM public.categories AS c
JOIN public.tasks AS t ON t.category_id = c.id
GROUP BY c.id, c.name
HAVING count(t.id) >= 4
ORDER BY c.id;

-- Q7. Одна задача с именами полей API.
SELECT id, title, completed, priority, category_id AS "categoryId"
FROM public.tasks
WHERE id = 4
ORDER BY id;
