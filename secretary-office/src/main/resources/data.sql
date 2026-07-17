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

