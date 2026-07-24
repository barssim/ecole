-- Insert tenant master data
INSERT IGNORE INTO tb_tenant (tenant_id, tenant_name) VALUES
('gardinia', 'Gardinia'),
('qods', 'Qods'),
('amana', 'Amana');

-- Insert test users with roles
INSERT IGNORE INTO tb_user (userno, surname, firstname, email, adresse, password, role, tenant_id) VALUES
(1, 'admin', 'Admin', 'admin@school.com', 'Admin Street', 'adminpass', 'admin,teacher', 'gardinia'),
(2, 'parent', 'Parent', 'parent@school.com', 'Parent Street', 'parentpass', 'parent', 'gardinia'),
(3, 'student', 'Student', 'student@school.com', 'Student Street', 'studentpass', 'student', 'gardinia'),
(4, 'manager', 'Manager', 'manager@school.com', 'Manager Street', 'managerpass', 'manager', 'qods'),
(5, 'teacher', 'Teacher', 'teacher@school.com', 'Teacher Street', 'teacherpass', 'teacher,admin', 'qods'),
(6, 'finance', 'Finance', 'finance@school.com', 'Finance Street', 'financepass', 'finance', 'qods');

