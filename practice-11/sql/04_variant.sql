-- Вариант 7. Задачи с API в названии и их категории.
SELECT t.id, t.title, t.completed, t.priority, c.name AS category_name
FROM public.tasks AS t
JOIN public.categories AS c ON c.id = t.category_id
WHERE t.title ILIKE '%API%'
ORDER BY t.id;
