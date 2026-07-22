INSERT IGNORE INTO tb_attestation
(id, user_id, student_name, class_name, title, type, date, status, document_url, issued_by, valid_from, valid_until, reference)
VALUES
(1, 5, 'Assil', '3e A', 'Attestation de scolarité', 'enrollment', '2024-09-01', 'approved', NULL, 'Directeur de l''école', '2024-09-01', '2025-08-31', 'ATT-2024-001-5'),
(2, 5, 'Assil', '3e A', 'Attestation de présence', 'attendance', '2025-01-15', 'approved', NULL, 'Coordinatrice pédagogique', '2025-01-01', '2025-12-31', 'ATT-2025-002-5'),
(3, 5, 'Assil', '3e A', 'Attestation d''inscription', 'registration', '2025-03-22', 'pending', NULL, 'Secrétariat', '2025-03-22', '2026-03-22', 'ATT-2025-003-5'),
(4, 6, 'Barae', '3e B', 'Attestation de scolarité', 'enrollment', '2024-09-01', 'approved', NULL, 'Directeur de l''école', '2024-09-01', '2025-08-31', 'ATT-2024-001-6'),
(5, 6, 'Barae', '3e B', 'Attestation de résultats académiques', 'academic', '2025-06-15', 'approved', NULL, 'Chef du département académique', '2025-06-15', '2025-12-31', 'ATT-2025-005-6'),
(6, 7, 'Tasnim', 'Terminale C', 'Attestation de scolarité', 'enrollment', '2024-09-01', 'approved', NULL, 'Directeur de l''école', '2024-09-01', '2025-08-31', 'ATT-2024-001-7');

INSERT IGNORE INTO tb_class (id, name)
VALUES
(1, '3e A'),
(2, '3e B'),
(3, 'Terminale C');

INSERT IGNORE INTO tb_class_student (class_id, student_name)
VALUES
(1, 'Yassine'),
(1, 'Majda'),
(1, 'Karim'),
(2, 'Sara'),
(2, 'Nabil'),
(2, 'Omar'),
(3, 'Lina'),
(3, 'Mohamed'),
(3, 'Hajar');

INSERT IGNORE INTO tb_exam
(id, subject, class_name, date, start_time, end_time, room, notes)
VALUES
(1, 'Mathématiques', '3e A', '2026-08-05', '08:00:00', '10:00:00', 'Salle 101', NULL),
(2, 'Français',      '3e B', '2026-08-06', '09:00:00', '11:00:00', 'Salle 102', NULL),
(3, 'Sciences',      '3e A', '2026-08-07', '10:00:00', '12:00:00', 'Salle 103', NULL),
(4, 'Histoire',      'Terminale C', '2026-08-08', '08:30:00', '10:30:00', 'Amphithéâtre', NULL);

INSERT IGNORE INTO tb_professor_attendance
(id, teacher_id, teacher_name, attendance_date, scheduled_time, check_in_time, status, notes, updated_at)
VALUES
(1, 101, 'Mme Benali', '2026-07-22', '08:00:00', '07:55:00', 'present', 'Cours de mathématiques', '2026-07-22 07:55:00'),
(2, 102, 'M. Alaoui', '2026-07-22', '08:30:00', '08:40:00', 'late', 'Retard signalé', '2026-07-22 08:40:00'),
(3, 103, 'Mme Idrissi', '2026-07-22', '09:00:00', NULL, 'absent', 'Absence déclarée', '2026-07-22 08:15:00');

