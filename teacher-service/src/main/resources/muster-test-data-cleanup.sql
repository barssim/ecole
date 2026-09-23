DELETE FROM teacher_course_files WHERE course_id IN (SELECT id FROM teacher_courses WHERE school_id = 'muster');
DELETE FROM teacher_courses WHERE school_id = 'muster';
DELETE FROM teacher_shared_documents WHERE school_id = 'muster';
DELETE FROM teacher_parent_meetings WHERE school_id = 'muster';
DELETE FROM teacher_assignments WHERE school_id = 'muster';
DELETE FROM tb_professor_attendance WHERE school_id = 'muster';
DELETE FROM teacher_notes WHERE school_id = 'muster';
