-- Seed data aligned with the users currently defined in usermanagement/data.sql.
-- Gardinia teachers: 201-205. Gardinia students: 301-310.

INSERT IGNORE INTO teacher_courses
(id, school_id, name, description, teacher_id, class_id, class_name, uploaded_at)
VALUES
(301, 'gardinia', 'Mathématiques - 3e A', 'Support de mathématiques préparé par Karim Alami.', '201', '1', '3e A', '2026-09-08 08:00:00'),
(302, 'gardinia', 'Français - 3e A', 'Support de français préparé par Nadia Ziani.', '204', '1', '3e A', '2026-09-08 09:00:00'),
(303, 'gardinia', 'Mathématiques - 3e B', 'Support de mathématiques préparé par Salma Benjelloun.', '202', '2', '3e B', '2026-09-09 08:00:00'),
(304, 'gardinia', 'Français - 3e B', 'Support de français préparé par Omar Belhaj.', '205', '2', '3e B', '2026-09-09 09:00:00'),
(305, 'gardinia', 'Mathématiques - 4e A', 'Support de mathématiques préparé par Yassine Ouazzani.', '203', '3', '4e A', '2026-09-10 08:00:00'),
(306, 'gardinia', 'Mathématiques - 4e B', 'Exercices complémentaires préparés par Karim Alami.', '201', '4', '4e B', '2026-09-10 09:00:00'),
(307, 'gardinia', 'Français - 5e A', 'Lecture et expression écrite préparées par Nadia Ziani.', '204', '5', '5e A', '2026-09-11 08:00:00'),
(308, 'gardinia', 'Mathématiques - 5e B', 'Révisions préparées par Salma Benjelloun.', '202', '6', '5e B', '2026-09-11 09:00:00'),
(309, 'gardinia', 'Français - 6e A', 'Grammaire et rédaction préparées par Omar Belhaj.', '205', '7', '6e A', '2026-09-12 08:00:00'),
(310, 'gardinia', 'Mathématiques - 6e B', 'Problèmes et géométrie préparés par Yassine Ouazzani.', '203', '8', '6e B', '2026-09-12 09:00:00');

INSERT IGNORE INTO teacher_course_files
(id, course_id, filename, url)
VALUES
(61, 301, 'mathematiques-3e-a.pdf', 'https://cdn.ecole.local/courses/mathematiques-3e-a.pdf'),
(62, 302, 'francais-3e-a.pdf', 'https://cdn.ecole.local/courses/francais-3e-a.pdf'),
(63, 303, 'mathematiques-3e-b.pdf', 'https://cdn.ecole.local/courses/mathematiques-3e-b.pdf'),
(64, 304, 'francais-3e-b.pdf', 'https://cdn.ecole.local/courses/francais-3e-b.pdf'),
(65, 305, 'mathematiques-4e-a.pdf', 'https://cdn.ecole.local/courses/mathematiques-4e-a.pdf'),
(66, 306, 'mathematiques-4e-b.pdf', 'https://cdn.ecole.local/courses/mathematiques-4e-b.pdf'),
(67, 307, 'francais-5e-a.pdf', 'https://cdn.ecole.local/courses/francais-5e-a.pdf'),
(68, 308, 'mathematiques-5e-b.pdf', 'https://cdn.ecole.local/courses/mathematiques-5e-b.pdf'),
(69, 309, 'francais-6e-a.pdf', 'https://cdn.ecole.local/courses/francais-6e-a.pdf'),
(70, 310, 'mathematiques-6e-b.pdf', 'https://cdn.ecole.local/courses/mathematiques-6e-b.pdf');

INSERT IGNORE INTO teacher_shared_documents
(id, school_id, title, type, link, uploaded_by, uploaded_at)
VALUES
(1, 'gardinia', 'Guide pédagogique de mathématiques', 'pdf', 'https://cdn.ecole.local/docs/guide-mathematiques.pdf', '201', '2026-08-21 10:00:00'),
(2, 'gardinia', 'Guide pédagogique de français', 'pdf', 'https://cdn.ecole.local/docs/guide-francais.pdf', '204', '2026-08-22 11:15:00');

INSERT IGNORE INTO teacher_parent_meetings
(id, school_id, title, meeting_date, location, details, created_by, created_at)
VALUES
(1, 'gardinia', 'Réunion parents-professeurs 3e A', '2026-09-10', 'Salle B2', 'Suivi de la progression des élèves.', '201', '2026-08-26 16:40:00'),
(2, 'gardinia', 'Réunion parents-professeurs 3e B', '2026-09-12', 'Salle A1', 'Présentation des objectifs du trimestre.', '204', '2026-08-26 17:10:00');

INSERT IGNORE INTO teacher_assignments
(id, school_id, teacher_id, class_id, class_name, title, description, attachment_name, attachment_url, due_date, created_by, created_at)
VALUES
(21, 'gardinia', '201', '1', '3e A', 'Exercices de mathématiques', 'Résoudre les exercices 1 à 12.', 'exercices-mathematiques.pdf', 'https://cdn.ecole.local/assignments/exercices-mathematiques.pdf', '2026-09-22', '201', '2026-09-08 08:30:00'),
(22, 'gardinia', '204', '1', '3e A', 'Rédaction française', 'Rédiger un texte argumentatif.', NULL, NULL, '2026-09-23', '204', '2026-09-08 09:30:00'),
(23, 'gardinia', '202', '2', '3e B', 'Révision des fractions', 'Préparer les exercices du chapitre 2.', NULL, NULL, '2026-09-24', '202', '2026-09-09 08:30:00'),
(24, 'gardinia', '205', '2', '3e B', 'Compréhension de texte', 'Lire le texte et répondre aux questions.', NULL, NULL, '2026-09-25', '205', '2026-09-09 09:30:00'),
(25, 'gardinia', '203', '3', '4e A', 'Problèmes de géométrie', 'Résoudre les trois problèmes proposés.', NULL, NULL, '2026-09-26', '203', '2026-09-10 08:30:00');

INSERT IGNORE INTO tb_professor_attendance
(id, school_id, teacher_id, teacher_name, attendance_date, scheduled_time, check_in_time, status, notes, updated_at)
VALUES
(1, 'gardinia', 201, 'Karim Alami', '2026-09-19', '08:00:00', '07:57:00', 'present', 'Cours de mathématiques', '2026-09-19 07:57:00'),
(2, 'gardinia', 202, 'Salma Benjelloun', '2026-09-19', '08:30:00', '08:35:00', 'late', 'Retard signalé', '2026-09-19 08:35:00'),
(3, 'gardinia', 203, 'Yassine Ouazzani', '2026-09-19', '09:00:00', '08:58:00', 'present', 'Cours de mathématiques', '2026-09-19 08:58:00'),
(4, 'gardinia', 204, 'Nadia Ziani', '2026-09-19', '08:00:00', NULL, 'absent', 'Absence justifiée', '2026-09-19 08:10:00'),
(5, 'gardinia', 205, 'Omar Belhaj', '2026-09-19', '09:30:00', '09:28:00', 'present', 'Cours de français', '2026-09-19 09:28:00');

INSERT IGNORE INTO teacher_notes
(id, school_id, teacher_id, class_id, class_name, student_name, subject, grade, entry_date)
VALUES
(1, 'gardinia', '201', '1', '3e A', 'Adam El Amrani', 'Mathématiques', 14.80, '2026-09-10'),
(2, 'gardinia', '201', '1', '3e A', 'Aya Bennani', 'Mathématiques', 16.50, '2026-09-10'),
(3, 'gardinia', '202', '1', '3e A', 'Bilal Alaoui', 'Mathématiques', 13.00, '2026-09-11'),
(4, 'gardinia', '202', '1', '3e A', 'Chaimae Idrissi', 'Mathématiques', 17.00, '2026-09-11'),
(5, 'gardinia', '203', '1', '3e A', 'Dounia Fassi', 'Mathématiques', 15.50, '2026-09-12'),
(6, 'gardinia', '203', '1', '3e A', 'Elias Naciri', 'Mathématiques', 12.50, '2026-09-12'),
(7, 'gardinia', '204', '1', '3e A', 'Fatima Zahraoui', 'Français', 16.00, '2026-09-13'),
(8, 'gardinia', '204', '1', '3e A', 'Hamza Tazi', 'Français', 13.50, '2026-09-13'),
(9, 'gardinia', '205', '1', '3e A', 'Imane Berrada', 'Français', 18.00, '2026-09-14'),
(10, 'gardinia', '205', '1', '3e A', 'Jad Chraibi', 'Français', 14.00, '2026-09-14');
