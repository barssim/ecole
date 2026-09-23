INSERT INTO student_schedule_entries
(id, school_id, student_id, day_name, slot_order, slot_text) VALUES
(9301, 'muster', '10008', 'Monday', 1, '08:00-09:00 Mathematics - Room A1'),
(9302, 'muster', '10008', 'Monday', 2, '09:15-10:15 French - Room A1'),
(9303, 'muster', '10008', 'Tuesday', 1, '08:00-09:00 Science - Laboratory'),
(9304, 'muster', '10009', 'Monday', 1, '08:00-09:00 Mathematics - Room A1');

INSERT INTO student_grades
(id, school_id, student_id, student_name, subject, grade, max_grade, date, class_id, class_name, teacher_name) VALUES
(9311, 'muster', '10008', 'Adam', 'Mathematics', 16.50, 20.00, '2026-09-22', '9101', 'Class 1A', 'Hamid'),
(9312, 'muster', '10008', 'Adam', 'French', 15.00, 20.00, '2026-09-23', '9101', 'Class 1A', 'Fatima'),
(9313, 'muster', '10009', 'Amira', 'Mathematics', 18.00, 20.00, '2026-09-22', '9101', 'Class 1A', 'Hamid');

INSERT INTO student_exercises
(id, school_id, student_id, title, description, subject, class_id, class_name, due_date, attachment_url, attachment_name, created_by, status, created_at) VALUES
(9321, 'muster', '10008', 'Fractions worksheet', 'Complete exercises 1 to 10.', 'Mathematics', '9101', 'Class 1A', '2026-10-01', NULL, NULL, '10003', 'assigned', '2026-09-22 08:30:00'),
(9322, 'muster', '10008', 'Short essay', 'Write a short text about your school.', 'French', '9101', 'Class 1A', '2026-10-03', NULL, NULL, '10004', 'in_progress', '2026-09-22 09:30:00'),
(9323, 'muster', '10009', 'Fractions worksheet', 'Complete exercises 1 to 10.', 'Mathematics', '9101', 'Class 1A', '2026-10-01', NULL, NULL, '10003', 'assigned', '2026-09-22 08:30:00');
