-- Seed data aligned with usermanagement/data.sql.
-- Gardinia students: 301-310. Gardinia teachers: 201-205.

INSERT IGNORE INTO student_schedule_entries
(id, school_id, student_id, day_name, slot_order, slot_text)
VALUES
(1, 'gardinia', '301', 'Monday', 1, '08:00-09:00 Mathématiques - Salle 101'),
(2, 'gardinia', '301', 'Monday', 2, '09:15-10:15 Français - Salle 102'),
(3, 'gardinia', '302', 'Tuesday', 1, '08:00-09:00 Mathématiques - Salle 101');

INSERT IGNORE INTO student_grades
(id, school_id, student_id, student_name, subject, grade, max_grade, date, class_id, class_name, teacher_name)
VALUES
(1, 'gardinia', '301', 'Adam El Amrani', 'Mathématiques', 17.50, 20.00, '2026-06-12', '1', '3e A', 'Karim Alami'),
(2, 'gardinia', '301', 'Adam El Amrani', 'Français', 15.00, 20.00, '2026-06-16', '1', '3e A', 'Nadia Ziani'),
(3, 'gardinia', '302', 'Aya Bennani', 'Mathématiques', 18.25, 20.00, '2026-06-18', '1', '3e A', 'Salma Benjelloun');

INSERT IGNORE INTO student_exercises
(id, school_id, student_id, title, description, subject, class_id, class_name, due_date, attachment_url, attachment_name, created_by, status, created_at)
VALUES
(1, 'gardinia', '301', 'Exercices de mathématiques', 'Résoudre les exercices 1 à 10.', 'Mathématiques', '1', '3e A', '2026-09-25', 'https://cdn.ecole.local/exercises/exercices-mathematiques.pdf', 'exercices-mathematiques.pdf', '201', 'assigned', '2026-09-10 08:30:00'),
(2, 'gardinia', '301', 'Analyse de texte', 'Préparer une analyse avec introduction, développement et conclusion.', 'Français', '1', '3e A', '2026-09-27', NULL, NULL, '204', 'in_progress', '2026-09-11 09:10:00'),
(3, 'gardinia', '302', 'Révision des fractions', 'Résoudre les exercices du chapitre 2.', 'Mathématiques', '1', '3e A', '2026-09-29', NULL, NULL, '202', 'assigned', '2026-09-12 10:15:00');
