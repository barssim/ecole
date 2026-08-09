INSERT IGNORE INTO teacher_courses
(id, tenant_id, name, description, teacher_id, uploaded_at)
VALUES
(1, 'gardinia', 'Mathematik - Bruchrechnung', 'Unterlagen zur Vertiefung von Bruechen und Prozentrechnung.', 'teacher-101', '2026-08-20 08:15:00'),
(2, 'gardinia', 'Franzoesisch - Textanalyse', 'Methoden zur strukturierten Analyse literarischer Texte.', 'teacher-102', '2026-08-21 09:00:00');

INSERT IGNORE INTO teacher_course_files
(id, course_id, filename, url)
VALUES
(1, 1, 'bruchrechnung-kapitel-1.pdf', 'https://cdn.ecole.local/courses/math-bruchrechnung-k1.pdf'),
(2, 1, 'uebungen-prozentrechnung.pdf', 'https://cdn.ecole.local/courses/math-prozent-uebungen.pdf'),
(3, 2, 'textanalyse-leitfaden.pdf', 'https://cdn.ecole.local/courses/fr-textanalyse-leitfaden.pdf');

INSERT IGNORE INTO teacher_shared_documents
(id, tenant_id, title, type, link, uploaded_by, uploaded_at)
VALUES
(1, 'gardinia', 'Jahresplanung 2026/27', 'pdf', 'https://cdn.ecole.local/docs/jahresplanung-2026-27.pdf', 'teacher-101', '2026-08-22 10:30:00'),
(2, 'gardinia', 'Vorlage Elternbrief', 'docx', 'https://cdn.ecole.local/docs/elternbrief-vorlage.docx', 'teacher-102', '2026-08-22 11:15:00');

INSERT IGNORE INTO teacher_parent_meetings
(id, tenant_id, title, meeting_date, location, details, created_by, created_at)
VALUES
(1, 'gardinia', 'Elternsprechstunde 3e A', '2026-09-10', 'Raum C2', 'Einzelgespraeche zu Lernstand und Foerderbedarf.', 'teacher-101', '2026-08-25 16:45:00'),
(2, 'gardinia', 'Elternabend 3e B', '2026-09-12', 'Saal A1', 'Informationen zu Pruefungsplanung und Hausaufgabenkonzept.', 'teacher-102', '2026-08-26 17:10:00');

INSERT IGNORE INTO teacher_assignments
(id, tenant_id, teacher_id, class_id, class_name, title, description, attachment_name, attachment_url, due_date, created_by, created_at)
VALUES
(1, 'gardinia', 'teacher-101', 'CLS-3A', '3e A', 'Arbeitsblatt Algebra', 'Aufgaben 1-12 bearbeiten und Rechenwege dokumentieren.', 'algebra-worksheet.pdf', 'https://cdn.ecole.local/assignments/algebra-worksheet.pdf', '2026-09-18', 'teacher-101', '2026-09-01 08:00:00'),
(2, 'gardinia', 'teacher-102', 'CLS-3B', '3e B', 'Textzusammenfassung', 'Kapitel 2 lesen und Zusammenfassung auf 1 Seite schreiben.', NULL, NULL, '2026-09-20', 'teacher-102', '2026-09-01 09:20:00');

INSERT IGNORE INTO tb_professor_attendance
(id, tenant_id, teacher_id, teacher_name, attendance_date, scheduled_time, check_in_time, status, notes, updated_at)
VALUES
(1, 'gardinia', 101, 'Mme Benali', '2026-08-27', '08:00:00', '07:56:00', 'present', 'Puenktlicher Unterrichtsbeginn.', '2026-08-27 07:56:00'),
(2, 'gardinia', 102, 'M. Alaoui', '2026-08-27', '08:30:00', '08:37:00', 'late', 'Kurze Verspaetung wegen Verkehr.', '2026-08-27 08:37:00');

INSERT IGNORE INTO teacher_notes
(id, tenant_id, teacher_id, class_id, class_name, student_name, subject, grade, entry_date)
VALUES
(1, 'gardinia', 'teacher-101', 'CLS-3A', '3e A', 'Assil Benali', 'Mathematik', 17.50, '2026-08-28'),
(2, 'gardinia', 'teacher-102', 'CLS-3B', '3e B', 'Barae Idrissi', 'Franzoesisch', 14.75, '2026-08-28');

