-- Insert test users with roles
INSERT IGNORE INTO tb_user (userno, surname, firstname, email, adresse, password, role) VALUES
(1, 'admin', 'Admin', 'admin@school.com', 'Admin Street', 'adminpass', 'admin,teacher'),
(2, 'parent', 'Parent', 'parent@school.com', 'Parent Street', 'parentpass', 'parent'),
(3, 'student', 'Student', 'student@school.com', 'Student Street', 'studentpass', 'student'),
(4, 'manager', 'Manager', 'manager@school.com', 'Manager Street', 'managerpass', 'manager'),
(5, 'teacher', 'Teacher', 'teacher@school.com', 'Teacher Street', 'teacherpass', 'teacher,admin'),
(6, 'finance', 'Finance', 'finance@school.com', 'Finance Street', 'financepass', 'finance');

