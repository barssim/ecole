INSERT INTO tb_class (id, school_id, name) VALUES
(9101, 'muster', 'Class 1A'),
(9102, 'muster', 'Class 1B');

INSERT INTO tb_class_student (class_id, student_name) VALUES
(9101, 'Adam'), (9101, 'Amira'), (9101, 'Bilal'), (9101, 'Chaima'), (9101, 'Ilyas'), (9101, 'Dunia'),
(9102, 'Hamza'), (9102, 'Iman'), (9102, 'Yassin'), (9102, 'Layla'), (9102, 'Nuh'), (9102, 'Safa');

INSERT INTO tb_class_teacher (class_id, teacher_name) VALUES
(9101, 'Hamid'), (9101, 'Fatima'), (9101, 'Omar'),
(9102, 'Salma'), (9102, 'Karim');

INSERT INTO class_schedule_entries (id, school_id, class_id, day_name, slot_order, slot_text) VALUES
(9111, 'muster', 9101, 'Monday', 1, '08:00-09:00 Mathematics - Room A1'),
(9112, 'muster', 9101, 'Monday', 2, '09:15-10:15 French - Room A1'),
(9113, 'muster', 9102, 'Tuesday', 1, '08:00-09:00 Science - Room B1'),
(9114, 'muster', 9102, 'Tuesday', 2, '09:15-10:15 Sports - Gym');

INSERT INTO tb_exam (id, school_id, subject, class_name, date, start_time, end_time, room, notes) VALUES
(9121, 'muster', 'Mathematics', 'Class 1A', '2026-10-12', '08:00:00', '09:30:00', 'Room A1', 'First-term assessment'),
(9122, 'muster', 'French', 'Class 1B', '2026-10-13', '09:00:00', '10:30:00', 'Room B1', 'Written assessment');

INSERT INTO tb_professor_attendance
(id, school_id, teacher_id, teacher_name, attendance_date, scheduled_time, check_in_time, status, notes, updated_at) VALUES
(9131, 'muster', 10003, 'Hamid', '2026-09-23', '08:00:00', '07:55:00', 'present', 'Mathematics class', '2026-09-23 07:55:00'),
(9132, 'muster', 10004, 'Fatima', '2026-09-23', '09:00:00', '09:08:00', 'late', 'Traffic delay', '2026-09-23 09:08:00'),
(9133, 'muster', 10005, 'Omar', '2026-09-23', '10:00:00', NULL, 'absent', 'Medical leave', '2026-09-23 10:05:00');

INSERT INTO tb_attestation
(id, school_id, user_id, student_name, class_name, title, type, date, status, document_url, issued_by, valid_from, valid_until, reference) VALUES
(9141, 'muster', 10008, 'Adam', 'Class 1A', 'Enrollment certificate', 'enrollment', '2026-09-20', 'issued', NULL, 'Nadia', '2026-09-01', '2027-06-30', 'MUSTER-ATT-001'),
(9142, 'muster', 10009, 'Amira', 'Class 1A', 'Attendance certificate', 'attendance', '2026-09-21', 'pending', NULL, NULL, '2026-09-01', '2027-06-30', 'MUSTER-ATT-002');

INSERT INTO tb_activity
(id, school_id, type, title, date, class_name, destination, description, created_by) VALUES
(9151, 'muster', 'announcements', 'Welcome to the new school year', '2026-09-24', 'All classes', 'Main hall', 'Important information for students and families.', 'Bouchra'),
(9152, 'muster', 'sorties', 'Science museum visit', '2026-10-05', 'Class 1A', 'Science Museum', 'Guided educational visit.', 'Bouchra'),
(9153, 'muster', 'fetes', 'Autumn school celebration', '2026-10-20', 'All classes', 'School courtyard', 'Music, games and student presentations.', 'Bouchra'),
(9154, 'muster', 'reunions', 'Parents and teachers meeting', '2026-10-10', 'Class 1A', 'Room A1', 'First-term progress discussion.', 'Bouchra'),
(9155, 'muster', 'announcements', 'School photo day', '2026-10-02', 'All classes', 'School courtyard', 'Students should wear the school uniform for the annual class photos.', 'Bouchra'),
(9156, 'muster', 'announcements', 'Library opening hours', '2026-10-06', 'All classes', 'School library', 'The library is now open Monday to Friday from 08:00 to 17:00.', 'Bouchra'),
(9157, 'muster', 'sorties', 'Botanical garden workshop', '2026-10-15', 'Class 1B', 'Botanical Garden', 'Plant discovery workshop and guided garden tour.', 'Bouchra'),
(9158, 'muster', 'sorties', 'Historic city discovery', '2026-11-03', 'Class 1A', 'Old Medina', 'Educational tour about local history and architecture.', 'Bouchra'),
(9159, 'muster', 'reunions', 'Class 1B parent information evening', '2026-10-17', 'Class 1B', 'Room B1', 'Presentation of the term goals and time for parent questions.', 'Bouchra'),
(9160, 'muster', 'reunions', 'Teaching team coordination', '2026-10-22', 'Class 1A', 'Teachers room', 'Coordination of assessments and student support measures.', 'Bouchra');

INSERT INTO tb_gallery_album
(id, school_id, title, description, cover_photo_url, created_by, created_at) VALUES
(9161, 'muster', 'School life', 'Highlights from Muster School activities.', '/images/muster.svg', 'Bouchra', '2026-09-20 12:00:00');

INSERT INTO tb_gallery_photo
(id, school_id, album_id, url, object_key, caption, created_by, created_at) VALUES
(9162, 'muster', 9161, '/images/muster.svg', NULL, 'Muster School welcome day', 'Bouchra', '2026-09-20 12:05:00');
