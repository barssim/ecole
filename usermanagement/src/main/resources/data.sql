-- Insert tenant master data
INSERT IGNORE INTO tb_tenant (tenant_id, tenant_name, tenant_email) VALUES
('gardinia', 'Gardinia', 'noreply_gardinia@example.com'),
('qods', 'Qods', 'noreply_qods@example.com'),
('amana', 'Amana', 'noreply_amana@example.com');

-- Insert test users with roles
INSERT IGNORE INTO tb_user (userno, surname, firstname, email, adresse, password, role, tenant_id) VALUES
(1, 'admin', 'Gardinia', 'admin@school.com', 'Admin Street', 'Youssef83#', 'manager', 'gardinia'),
(2, 'parent', 'Parent', 'parent@school.com', 'Parent Street', 'parentpass', 'parent', 'gardinia'),
(3, 'student', 'Student', 'student@school.com', 'Student Street', 'studentpass', 'student', 'gardinia'),
(4, 'admin', 'Qods', 'manager@school.com', 'Manager Street', 'Halima68#', 'manager', 'qods'),
(5, 'teacher', 'Teacher', 'teacher@school.com', 'Teacher Street', 'teacherpass', 'teacher', 'qods'),
(6, 'finance', 'Finance', 'finance@school.com', 'Finance Street', 'financepass', 'finance', 'qods');

