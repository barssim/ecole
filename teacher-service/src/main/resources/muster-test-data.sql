INSERT INTO teacher_courses
(id, school_id, name, description, teacher_id, class_id, class_name, uploaded_at) VALUES
(9201, 'muster', 'Mathematics basics', 'Numbers, fractions and geometry.', '10003', '9101', 'Class 1A', '2026-09-20 08:00:00'),
(9202, 'muster', 'French language', 'Reading and written expression.', '10004', '9101', 'Class 1A', '2026-09-20 09:00:00'),
(9203, 'muster', 'Science experiments', 'Introduction to practical science.', '10006', '9102', 'Class 1B', '2026-09-21 08:00:00');

INSERT INTO teacher_course_files (id, course_id, filename, url) VALUES
(9211, 9201, 'mathematics-basics.pdf', '/api/uploads/muster-mathematics-basics.pdf'),
(9212, 9202, 'french-reading.pdf', '/api/uploads/muster-french-reading.pdf');

INSERT INTO teacher_assignments
(id, school_id, teacher_id, class_id, class_name, title, description, attachment_name, attachment_url, due_date, created_by, created_at) VALUES
(9221, 'muster', '10003', '9101', 'Class 1A', 'Fractions worksheet', 'Complete exercises 1 to 10.', NULL, NULL, '2026-10-01', '10003', '2026-09-22 08:30:00'),
(9222, 'muster', '10004', '9101', 'Class 1A', 'Short essay', 'Write a short text about your school.', NULL, NULL, '2026-10-03', '10004', '2026-09-22 09:30:00'),
(9223, 'muster', '10006', '9102', 'Class 1B', 'Plant observation', 'Document the growth of a plant.', NULL, NULL, '2026-10-05', '10006', '2026-09-22 10:30:00');

INSERT INTO teacher_notes
(id, school_id, teacher_id, class_id, class_name, student_name, subject, grade, entry_date) VALUES
(9231, 'muster', '10003', '9101', 'Class 1A', 'Adam', 'Mathematics', 16.50, '2026-09-22'),
(9232, 'muster', '10003', '9101', 'Class 1A', 'Amira', 'Mathematics', 18.00, '2026-09-22'),
(9233, 'muster', '10004', '9101', 'Class 1A', 'Bilal', 'French', 14.50, '2026-09-22'),
(9234, 'muster', '10006', '9102', 'Class 1B', 'Hamza', 'Science', 17.00, '2026-09-22');

INSERT INTO teacher_shared_documents
(id, school_id, title, type, link, uploaded_by, uploaded_at) VALUES
(9241, 'muster', 'Teaching calendar', 'pdf', '/documents/muster-teaching-calendar.pdf', '10003', '2026-09-20 10:00:00'),
(9242, 'muster', 'Assessment guidelines', 'pdf', '/documents/muster-assessment-guidelines.pdf', '10004', '2026-09-20 11:00:00');

INSERT INTO teacher_parent_meetings
(id, school_id, title, meeting_date, location, details, created_by, created_at) VALUES
(9251, 'muster', 'Class 1A parent meeting', '2026-10-10', 'Room A1', 'Discuss student progress and learning goals.', '10003', '2026-09-22 14:00:00');

INSERT INTO tb_professor_attendance
(id, school_id, teacher_id, teacher_name, attendance_date, scheduled_time, check_in_time, status, notes, updated_at) VALUES
(9261, 'muster', 10003, 'Hamid', '2026-09-23', '08:00:00', '07:55:00', 'present', 'On time', '2026-09-23 07:55:00'),
(9262, 'muster', 10004, 'Fatima', '2026-09-23', '09:00:00', '09:08:00', 'late', 'Traffic delay', '2026-09-23 09:08:00');
