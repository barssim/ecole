INSERT IGNORE INTO teacher_courses
(id, tenant_id, name, description, teacher_id, uploaded_at)
VALUES
(1, 'gardinia', 'Mathematik - Bruchrechnung', 'Unterlagen zur Vertiefung von Bruechen und Prozentrechnung.', 'teacher-101', '2026-08-20 08:15:00'),
(2, 'gardinia', 'Franzoesisch - Textanalyse', 'Methoden zur strukturierten Analyse literarischer Texte.', 'teacher-102', '2026-08-21 09:00:00');

-- 30 subject assignments for the teacher roster seeded in usermanagement.data.sql
-- (tb_user, userno 201..230 / teacher_id 'teacher-201'..'teacher-230'), 3 teachers per subject.
INSERT IGNORE INTO teacher_courses
(id, tenant_id, name, description, teacher_id, uploaded_at)
VALUES
(101, 'gardinia', 'Mathématiques', 'Titulaire de la matière Mathématiques - Karim Alami.', 'teacher-201', '2026-08-25 08:00:00'),
(102, 'gardinia', 'Mathématiques', 'Titulaire de la matière Mathématiques - Salma Benjelloun.', 'teacher-202', '2026-08-25 08:05:00'),
(103, 'gardinia', 'Mathématiques', 'Titulaire de la matière Mathématiques - Yassine Ouazzani.', 'teacher-203', '2026-08-25 08:10:00'),
(104, 'gardinia', 'Français', 'Titulaire de la matière Français - Nadia Ziani.', 'teacher-204', '2026-08-25 08:15:00'),
(105, 'gardinia', 'Français', 'Titulaire de la matière Français - Omar Belhaj.', 'teacher-205', '2026-08-25 08:20:00'),
(106, 'gardinia', 'Français', 'Titulaire de la matière Français - Imane Cherkaoui.', 'teacher-206', '2026-08-25 08:25:00'),
(107, 'gardinia', 'Arabe', 'Titulaire de la matière Arabe - Rachid Filali.', 'teacher-207', '2026-08-25 08:30:00'),
(108, 'gardinia', 'Arabe', 'Titulaire de la matière Arabe - Latifa Guessous.', 'teacher-208', '2026-08-25 08:35:00'),
(109, 'gardinia', 'Arabe', 'Titulaire de la matière Arabe - Samir Haddaoui.', 'teacher-209', '2026-08-25 08:40:00'),
(110, 'gardinia', 'Anglais', 'Titulaire de la matière Anglais - Hind Iraqi.', 'teacher-210', '2026-08-25 08:45:00'),
(111, 'gardinia', 'Anglais', 'Titulaire de la matière Anglais - Younes Jabri.', 'teacher-211', '2026-08-25 08:50:00'),
(112, 'gardinia', 'Anglais', 'Titulaire de la matière Anglais - Widad Kabbaj.', 'teacher-212', '2026-08-25 08:55:00'),
(113, 'gardinia', 'Sciences de la Vie et de la Terre', 'Titulaire de la matière SVT - Anouar Lahlou.', 'teacher-213', '2026-08-25 09:00:00'),
(114, 'gardinia', 'Sciences de la Vie et de la Terre', 'Titulaire de la matière SVT - Siham Mekouar.', 'teacher-214', '2026-08-25 09:05:00'),
(115, 'gardinia', 'Sciences de la Vie et de la Terre', 'Titulaire de la matière SVT - Othmane Naji.', 'teacher-215', '2026-08-25 09:10:00'),
(116, 'gardinia', 'Physique-Chimie', 'Titulaire de la matière Physique-Chimie - Meryem Ouahbi.', 'teacher-216', '2026-08-25 09:15:00'),
(117, 'gardinia', 'Physique-Chimie', 'Titulaire de la matière Physique-Chimie - Hicham Qadiri.', 'teacher-217', '2026-08-25 09:20:00'),
(118, 'gardinia', 'Physique-Chimie', 'Titulaire de la matière Physique-Chimie - Sanae Rifai.', 'teacher-218', '2026-08-25 09:25:00'),
(119, 'gardinia', 'Histoire-Géographie', 'Titulaire de la matière Histoire-Géographie - Tarik Saadi.', 'teacher-219', '2026-08-25 09:30:00'),
(120, 'gardinia', 'Histoire-Géographie', 'Titulaire de la matière Histoire-Géographie - Ghizlane Tahiri.', 'teacher-220', '2026-08-25 09:35:00'),
(121, 'gardinia', 'Histoire-Géographie', 'Titulaire de la matière Histoire-Géographie - Adnane Usmani.', 'teacher-221', '2026-08-25 09:40:00'),
(122, 'gardinia', 'Éducation Islamique', 'Titulaire de la matière Éducation Islamique - Rim Wahbi.', 'teacher-222', '2026-08-25 09:45:00'),
(123, 'gardinia', 'Éducation Islamique', 'Titulaire de la matière Éducation Islamique - Karima Yousfi.', 'teacher-223', '2026-08-25 09:50:00'),
(124, 'gardinia', 'Éducation Islamique', 'Titulaire de la matière Éducation Islamique - Fouad Zniber.', 'teacher-224', '2026-08-25 09:55:00'),
(125, 'gardinia', 'Éducation Physique et Sportive', 'Titulaire de la matière EPS - Amine Aissaoui.', 'teacher-225', '2026-08-25 10:00:00'),
(126, 'gardinia', 'Éducation Physique et Sportive', 'Titulaire de la matière EPS - Dounia Belmir.', 'teacher-226', '2026-08-25 10:05:00'),
(127, 'gardinia', 'Éducation Physique et Sportive', 'Titulaire de la matière EPS - Ayoub Chafai.', 'teacher-227', '2026-08-25 10:10:00'),
(128, 'gardinia', 'Arts Plastiques', 'Titulaire de la matière Arts Plastiques - Hafsa Draoui.', 'teacher-228', '2026-08-25 10:15:00'),
(129, 'gardinia', 'Arts Plastiques', 'Titulaire de la matière Arts Plastiques - Bilal Essaidi.', 'teacher-229', '2026-08-25 10:20:00'),
(130, 'gardinia', 'Arts Plastiques', 'Titulaire de la matière Arts Plastiques - Nawal Fakhouri.', 'teacher-230', '2026-08-25 10:25:00');

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
(1, 'gardinia', 101, 'Mme Benali', '2026-09-19', '08:00:00', '07:55:00', 'present', 'Cours de mathématiques', '2026-09-19 07:55:00'),
(2, 'gardinia', 102, 'M. Alaoui', '2026-09-19', '08:30:00', '08:40:00', 'late', 'Retard signalé', '2026-09-19 08:40:00'),
(3, 'gardinia', 103, 'Mme Idrissi', '2026-09-19', '09:00:00', NULL, 'absent', 'Absence déclarée', '2026-09-19 08:15:00'),
(4, 'gardinia', 104, 'M. Chraibi', '2026-09-19', '08:00:00', '07:58:00', 'present', 'Cours de français', '2026-09-19 07:58:00'),
(5, 'gardinia', 105, 'Mme Fassi', '2026-09-19', '08:00:00', '08:20:00', 'late', 'Retard dû à un embouteillage', '2026-09-19 08:20:00'),
(6, 'gardinia', 106, 'M. Naciri', '2026-09-19', '09:00:00', NULL, 'absent', 'Congé maladie', '2026-09-19 08:30:00'),
(7, 'gardinia', 107, 'Mme Tazi', '2026-09-19', '08:30:00', '08:28:00', 'present', 'Cours d''éducation islamique', '2026-09-19 08:28:00'),
(8, 'gardinia', 108, 'M. Berrada', '2026-09-19', '09:30:00', '09:45:00', 'late', 'Retard signalé au secrétariat', '2026-09-19 09:45:00'),
(9, 'gardinia', 201, 'Karim Alami', '2026-09-19', '08:00:00', '07:57:00', 'present', 'Cours de mathématiques', '2026-09-19 07:57:00'),
(10, 'gardinia', 204, 'Nadia Ziani', '2026-09-19', '08:00:00', NULL, 'absent', 'Absence non justifiée', '2026-09-19 08:10:00'),
(11, 'gardinia', 207, 'Rachid Filali', '2026-09-19', '09:00:00', '09:12:00', 'late', 'Retard signalé', '2026-09-19 09:12:00'),
(12, 'gardinia', 210, 'Hind Iraqi', '2026-09-19', '10:00:00', '09:58:00', 'present', 'Cours d''anglais', '2026-09-19 09:58:00'),
(13, 'gardinia', 213, 'Anouar Lahlou', '2026-09-19', '10:30:00', NULL, 'absent', 'Congé personnel', '2026-09-19 10:00:00'),
(14, 'gardinia', 216, 'Meryem Ouahbi', '2026-09-19', '08:00:00', '08:05:00', 'present', 'Cours de physique-chimie', '2026-09-19 08:05:00'),
(15, 'gardinia', 219, 'Tarik Saadi', '2026-09-19', '08:30:00', '08:50:00', 'late', 'Retard signalé', '2026-09-19 08:50:00'),
(16, 'gardinia', 222, 'Rim Wahbi', '2026-09-19', '09:00:00', '08:59:00', 'present', 'Cours d''éducation islamique', '2026-09-19 08:59:00'),
(17, 'gardinia', 225, 'Amine Aissaoui', '2026-09-19', '10:00:00', NULL, 'absent', 'Absence déclarée', '2026-09-19 09:30:00'),
(18, 'gardinia', 228, 'Hafsa Draoui', '2026-09-19', '11:00:00', '11:03:00', 'present', 'Cours d''arts plastiques', '2026-09-19 11:03:00');

INSERT IGNORE INTO teacher_notes
(id, tenant_id, teacher_id, class_id, class_name, student_name, subject, grade, entry_date)
VALUES
(1, 'gardinia', 'teacher-101', 'CLS-3A', '3e A', 'Assil Benali', 'Mathematik', 17.50, '2026-08-28'),
(2, 'gardinia', 'teacher-102', 'CLS-3B', '3e B', 'Barae Idrissi', 'Franzoesisch', 14.75, '2026-08-28');

