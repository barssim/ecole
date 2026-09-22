INSERT IGNORE INTO tb_class (id, school_id, name)
VALUES
(1, 'gardinia', '3e A'),
(2, 'gardinia', '3e B'),
(3, 'gardinia', '4e A'),
(4, 'gardinia', '4e B'),
(5, 'gardinia', '5e A'),
(6, 'gardinia', '5e B'),
(7, 'gardinia', '6e A'),
(8, 'gardinia', '6e B');

INSERT IGNORE INTO tb_class_student (class_id, student_name)
VALUES
(1, 'Adam El Amrani'),
(1, 'Aya Bennani'),
(1, 'Bilal Alaoui'),
(1, 'Chaimae Idrissi'),
(1, 'Dounia Fassi'),
(1, 'Elias Naciri'),
(1, 'Fatima Zahraoui'),
(1, 'Hamza Tazi'),
(1, 'Imane Berrada'),
(1, 'Jad Chraibi');

INSERT IGNORE INTO tb_class_teacher (class_id, teacher_name)
VALUES
(1, 'M. Alami'),
(2, 'Mme Benjelloun'),
(3, 'M. Ouazzani'),
(4, 'Mme Ziani'),
(5, 'M. Belhaj'),
(6, 'Mme Benjelloun'),
(7, 'M. Ouazzani'),
(8, 'Mme Ziani');

INSERT IGNORE INTO tb_class_teacher (class_id, teacher_name)
VALUES
(1, 'Benjelloun'),
(2, 'Ouazzani'),
(3, 'Ziani'),
(4, 'Belhaj'),
(5, 'Alami'),
(6, 'Benjelloun'),
(7, 'Ouazzani'),
(8, 'Ziani');

INSERT IGNORE INTO tb_activity
(id, school_id, type, title, date, class_name, destination, description, created_by)
VALUES
(1, 'gardinia', 'sorties', 'Sortie pédagogique au musée', '2026-09-12', '3e A', 'Musée des sciences', 'Sortie encadrée pour découverte scientifique.', '1'),
(2, 'gardinia', 'fetes', 'Fête de rentrée', '2026-09-20', '3e B', 'Cour principale', 'Activité festive de bienvenue.', '1'),
(3, 'gardinia', 'reunions', 'Réunion parents-professeurs', '2026-10-05', '3e A', 'Salle A2', 'Point trimestriel avec les familles.', '1'),
(4, 'gardinia', 'sorties', 'Sortie culturelle au musée d''histoire', '2026-10-14', '3e A', 'Musée d''histoire et civilisation', 'Découverte du patrimoine culturel national.', '1'),
(19, 'gardinia', 'reunions', 'Réunion bilan de fin de trimestre', '2027-01-11', '3e A', 'Salle A2', 'Évaluation des résultats du premier trimestre.', '1');

INSERT IGNORE INTO tb_exam
(id, school_id, subject, class_name, date, start_time, end_time, room, notes)
VALUES
(1, 'gardinia', 'Mathématiques', '3e A', '2026-08-05', '08:00:00', '10:00:00', 'Salle 101', NULL),
(2, 'gardinia', 'Français',      '3e B', '2026-08-06', '09:00:00', '11:00:00', 'Salle 102', NULL),
(3, 'gardinia', 'Sciences',      '3e A', '2026-08-07', '10:00:00', '12:00:00', 'Salle 103', NULL),
(4, 'gardinia', 'Histoire',      'Terminale C', '2026-08-08', '08:30:00', '10:30:00', 'Amphithéâtre', NULL);

INSERT IGNORE INTO tb_professor_attendance
(id, school_id, teacher_id, teacher_name, attendance_date, scheduled_time, check_in_time, status, notes, updated_at)
VALUES
(9, 'gardinia', 201, 'Karim Alami', '2026-09-19', '08:00:00', '07:57:00', 'present', 'Cours de mathématiques', '2026-09-19 07:57:00'),
(10, 'gardinia', 204, 'Nadia Ziani', '2026-09-19', '08:00:00', NULL, 'absent', 'Absence non justifiée', '2026-09-19 08:10:00');

-- Backfill legacy rows created before SCHOOL support.
UPDATE tb_class SET school_id = 'gardinia' WHERE school_id IS NULL OR school_id = '';
UPDATE tb_attestation SET school_id = 'gardinia' WHERE school_id IS NULL OR school_id = '';
UPDATE tb_activity SET school_id = 'gardinia' WHERE school_id IS NULL OR school_id = '';
UPDATE tb_exam SET school_id = 'gardinia' WHERE school_id IS NULL OR school_id = '';
UPDATE tb_professor_attendance SET school_id = 'gardinia' WHERE school_id IS NULL OR school_id = '';

INSERT IGNORE INTO class_schedule_entries
(id, school_id, class_id, day_name, slot_order, slot_text)
VALUES
(1, 'gardinia', 1, 'Monday', 1, '08:00-09:00 Français - Salle 101'),
(2, 'gardinia', 1, 'Monday', 2, '09:00-10:00 Arabe - Salle 101'),
(3, 'gardinia', 1, 'Monday', 3, '10:15-11:15 Anglais - Salle 101'),
(4, 'gardinia', 1, 'Monday', 4, '11:15-12:15 Sciences de la Vie et de la Terre - Salle 101');


