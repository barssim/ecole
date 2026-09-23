INSERT INTO parent_registrations
(id, school_id, parent_name, student_name, class_name, status, notes, created_at) VALUES
(9401, 'muster', 'Bouchra', 'Adam', 'Class 1A', 'approved', 'Registration documents complete.', '2026-09-10 09:00:00'),
(9402, 'muster', 'Bouchra', 'Amira', 'Class 1A', 'pending', 'Waiting for one supporting document.', '2026-09-11 10:00:00');

INSERT INTO parent_attestation_requests
(id, school_id, user_id, student_name, class_name, type, reason, status, created_at) VALUES
(9411, 'muster', 10001, 'Adam', 'Class 1A', 'enrollment', 'Administrative request', 'approved', '2026-09-15 11:00:00'),
(9412, 'muster', 10001, 'Amira', 'Class 1A', 'attendance', 'Transport application', 'pending', '2026-09-16 11:00:00');

INSERT INTO parent_attendance_records
(id, school_id, student_name, class_name, date, status, minutes_late, comment) VALUES
(9421, 'muster', 'Adam', 'Class 1A', '2026-09-22', 'present', 0, 'On time'),
(9422, 'muster', 'Amira', 'Class 1A', '2026-09-22', 'late', 8, 'Transport delay');

INSERT INTO parent_progress_records
(id, school_id, student_name, class_name, subject, score, max_score, status, updated_at) VALUES
(9431, 'muster', 'Adam', 'Class 1A', 'Mathematics', 16.5, 20.0, 'good', '2026-09-22'),
(9432, 'muster', 'Amira', 'Class 1A', 'French', 18.0, 20.0, 'excellent', '2026-09-22');

INSERT INTO parent_payments
(id, school_id, student_name, class_name, amount, currency, method, payment_date, reference, notes) VALUES
(9441, 'muster', 'Adam', 'Class 1A', 1500.00, 'MAD', 'card', '2026-09-05', 'MUSTER-PAY-001', 'September tuition paid'),
(9442, 'muster', 'Amira', 'Class 1A', 750.00, 'MAD', 'transfer', '2026-09-06', 'MUSTER-PAY-002', 'First installment');
