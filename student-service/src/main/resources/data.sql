INSERT IGNORE INTO student_schedule_entries
(id, tenant_id, student_id, day_name, slot_order, slot_text)
VALUES
(1, 'gardinia', 'STU-1001', 'Monday', 1, '08:00-09:00 Mathematik - Raum 101'),
(2, 'gardinia', 'STU-1001', 'Monday', 2, '09:15-10:15 Franzoesisch - Raum 102'),
(3, 'gardinia', 'STU-1002', 'Tuesday', 1, '08:00-09:00 Naturwissenschaften - Labor 1');

INSERT IGNORE INTO student_grades
(id, tenant_id, student_id, student_name, subject, grade, max_grade, date, class_id, class_name, teacher_name)
VALUES
(1, 'gardinia', 'STU-1001', 'Assil Benali', 'Mathematik', 17.50, 20.00, '2026-06-12', 'CLS-3A', '3e A', 'Mme Benali'),
(2, 'gardinia', 'STU-1001', 'Assil Benali', 'Franzoesisch', 15.00, 20.00, '2026-06-16', 'CLS-3A', '3e A', 'M. Alaoui'),
(3, 'gardinia', 'STU-1002', 'Barae Idrissi', 'Naturwissenschaften', 18.25, 20.00, '2026-06-18', 'CLS-3B', '3e B', 'Mme Idrissi');

INSERT IGNORE INTO student_exercises
(id, tenant_id, student_id, title, description, subject, class_id, class_name, due_date, attachment_url, attachment_name, created_by, status, created_at)
VALUES
(1, 'gardinia', 'STU-1001', 'Algebra Blatt 4', 'Loese die Aufgaben 1 bis 10 im Heft.', 'Mathematik', 'CLS-3A', '3e A', '2026-09-25', 'https://cdn.ecole.local/exercises/algebra-blatt-4.pdf', 'algebra-blatt-4.pdf', 'teacher-101', 'assigned', '2026-09-10 08:30:00'),
(2, 'gardinia', 'STU-1001', 'Textanalyse Kurzgeschichte', 'Kurze Analyse mit Einleitung, Hauptteil und Schluss.', 'Franzoesisch', 'CLS-3A', '3e A', '2026-09-27', NULL, NULL, 'teacher-102', 'in_progress', '2026-09-11 09:10:00'),
(3, 'gardinia', 'STU-1002', 'Protokoll Laborversuch', 'Dokumentiere den Versuch zum Wasserkreislauf.', 'Naturwissenschaften', 'CLS-3B', '3e B', '2026-09-29', 'https://cdn.ecole.local/exercises/lab-template.docx', 'lab-template.docx', 'teacher-103', 'submitted', '2026-09-12 10:15:00');

