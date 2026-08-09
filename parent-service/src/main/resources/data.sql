INSERT IGNORE INTO parent_registrations
(id, tenant_id, parent_name, student_name, class_name, status, notes, created_at)
VALUES
(1, 'gardinia', 'Nadia Benali', 'Assil Benali', '3e A', 'approved', 'Unterlagen vollstaendig eingereicht.', '2026-07-01 09:00:00'),
(2, 'gardinia', 'Samir Idrissi', 'Barae Idrissi', '3e B', 'pending', 'Wartet auf bestaetigte Wohnsitzbescheinigung.', '2026-07-03 11:20:00');

INSERT IGNORE INTO parent_attestation_requests
(id, tenant_id, user_id, student_name, class_name, type, reason, status, created_at)
VALUES
(1, 'gardinia', 2, 'Assil Benali', '3e A', 'enrollment', 'Visumantrag', 'approved', '2026-07-08 14:10:00'),
(2, 'gardinia', 3, 'Barae Idrissi', '3e B', 'attendance', 'Antrag auf Schuelerfahrkarte', 'pending', '2026-07-09 10:45:00');

INSERT IGNORE INTO parent_attendance_records
(id, tenant_id, student_name, class_name, date, status, minutes_late, comment)
VALUES
(1, 'gardinia', 'Assil Benali', '3e A', '2026-07-11', 'present', 0, 'Puenktlich im Unterricht.'),
(2, 'gardinia', 'Barae Idrissi', '3e B', '2026-07-11', 'late', 12, 'Verkehrsbedingt verspaetet.');

INSERT IGNORE INTO parent_progress_records
(id, tenant_id, student_name, class_name, subject, score, max_score, status, updated_at)
VALUES
(1, 'gardinia', 'Assil Benali', '3e A', 'Mathematik', 17.5, 20.0, 'good', '2026-07-12'),
(2, 'gardinia', 'Barae Idrissi', '3e B', 'Franzoesisch', 14.0, 20.0, 'average', '2026-07-12');

INSERT IGNORE INTO parent_payments
(id, tenant_id, student_name, class_name, amount, currency, method, payment_date, reference, notes)
VALUES
(1, 'gardinia', 'Assil Benali', '3e A', 1500.00, 'MAD', 'card', '2026-07-05', 'PAY-2026-07-001', 'Schulgeld Juli bezahlt.'),
(2, 'gardinia', 'Barae Idrissi', '3e B', 1200.00, 'MAD', 'transfer', '2026-07-06', 'PAY-2026-07-002', 'Teilzahlung eingegangen.');

