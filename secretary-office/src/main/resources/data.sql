INSERT IGNORE INTO tb_attestation
(id, tenant_id, user_id, student_name, class_name, title, type, date, status, document_url, issued_by, valid_from, valid_until, reference)
VALUES
(1, 'gardinia', 5, 'Assil', '3e A', 'Attestation de scolarité', 'enrollment', '2024-09-01', 'approved', NULL, 'Directeur de l''école', '2024-09-01', '2025-08-31', 'ATT-2024-001-5'),
(2, 'gardinia', 5, 'Assil', '3e A', 'Attestation de présence', 'attendance', '2025-01-15', 'approved', NULL, 'Coordinatrice pédagogique', '2025-01-01', '2025-12-31', 'ATT-2025-002-5'),
(3, 'gardinia', 5, 'Assil', '3e A', 'Attestation d''inscription', 'registration', '2025-03-22', 'pending', NULL, 'Secrétariat', '2025-03-22', '2026-03-22', 'ATT-2025-003-5'),
(4, 'gardinia', 6, 'Barae', '3e B', 'Attestation de scolarité', 'enrollment', '2024-09-01', 'approved', NULL, 'Directeur de l''école', '2024-09-01', '2025-08-31', 'ATT-2024-001-6'),
(5, 'gardinia', 6, 'Barae', '3e B', 'Attestation de résultats académiques', 'academic', '2025-06-15', 'approved', NULL, 'Chef du département académique', '2025-06-15', '2025-12-31', 'ATT-2025-005-6'),
(6, 'gardinia', 7, 'Tasnim', 'Terminale C', 'Attestation de scolarité', 'enrollment', '2024-09-01', 'approved', NULL, 'Directeur de l''école', '2024-09-01', '2025-08-31', 'ATT-2024-001-7');

INSERT IGNORE INTO tb_class (id, tenant_id, name)
VALUES
(1, 'gardinia', '3e A'),
(2, 'gardinia', '3e B'),
(3, 'gardinia', 'Terminale C');

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

INSERT IGNORE INTO tb_class_teacher (class_id, teacher_name)
VALUES
(1, 'Mme Benali'),
(2, 'M. Alaoui'),
(3, 'Mme Idrissi');

INSERT IGNORE INTO tb_class_teacher (class_id, teacher_name)
VALUES
(1, 'benali'),
(2, 'alaoui'),
(3, 'idrissi');

INSERT IGNORE INTO tb_activity
(id, tenant_id, type, title, date, class_name, destination, description, created_by)
VALUES
(1, 'gardinia', 'sorties', 'Sortie pédagogique au musée', '2026-09-12', '3e A', 'Musée des sciences', 'Sortie encadrée pour découverte scientifique.', 'secretary'),
(2, 'gardinia', 'fetes', 'Fête de rentrée', '2026-09-20', '3e B', 'Cour principale', 'Activité festive de bienvenue.', 'secretary'),
(3, 'gardinia', 'reunions', 'Réunion parents-professeurs', '2026-10-05', 'Terminale C', 'Salle A2', 'Point trimestriel avec les familles.', 'secretary');

INSERT IGNORE INTO tb_exam
(id, tenant_id, subject, class_name, date, start_time, end_time, room, notes)
VALUES
(1, 'gardinia', 'Mathématiques', '3e A', '2026-08-05', '08:00:00', '10:00:00', 'Salle 101', NULL),
(2, 'gardinia', 'Français',      '3e B', '2026-08-06', '09:00:00', '11:00:00', 'Salle 102', NULL),
(3, 'gardinia', 'Sciences',      '3e A', '2026-08-07', '10:00:00', '12:00:00', 'Salle 103', NULL),
(4, 'gardinia', 'Histoire',      'Terminale C', '2026-08-08', '08:30:00', '10:30:00', 'Amphithéâtre', NULL);

INSERT IGNORE INTO tb_professor_attendance
(id, tenant_id, teacher_id, teacher_name, attendance_date, scheduled_time, check_in_time, status, notes, updated_at)
VALUES
(1, 'gardinia', 101, 'Mme Benali', '2026-07-22', '08:00:00', '07:55:00', 'present', 'Cours de mathématiques', '2026-07-22 07:55:00'),
(2, 'gardinia', 102, 'M. Alaoui', '2026-07-22', '08:30:00', '08:40:00', 'late', 'Retard signalé', '2026-07-22 08:40:00'),
(3, 'gardinia', 103, 'Mme Idrissi', '2026-07-22', '09:00:00', NULL, 'absent', 'Absence déclarée', '2026-07-22 08:15:00');

-- Backfill legacy rows created before tenant support.
UPDATE tb_class SET tenant_id = 'gardinia' WHERE tenant_id IS NULL OR tenant_id = '';
UPDATE tb_attestation SET tenant_id = 'gardinia' WHERE tenant_id IS NULL OR tenant_id = '';
UPDATE tb_activity SET tenant_id = 'gardinia' WHERE tenant_id IS NULL OR tenant_id = '';
UPDATE tb_exam SET tenant_id = 'gardinia' WHERE tenant_id IS NULL OR tenant_id = '';
UPDATE tb_professor_attendance SET tenant_id = 'gardinia' WHERE tenant_id IS NULL OR tenant_id = '';

