-- Insert school master data
INSERT IGNORE INTO tb_school (school_id, school_name, school_email) VALUES
('gardinia', 'Gardinia', 'noreply_gardinia@example.com'),
('qods', 'Qods', 'noreply_qods@example.com'),
('amana', 'Amana', 'noreply_amana@example.com'),
('muster', 'Muster', 'noreply_muster@example.com');

INSERT IGNORE INTO tb_school_customization (school_id, customization_json) VALUES
('muster', '{"name":{"en":"Muster School","fr":"Ecole Muster","ar":"مدرسة موستر"},"logo":"/logos/muster.svg","image":"/images/muster.svg","about":{"title":{"en":"About Muster School","fr":"A propos de Ecole Muster","ar":"حول مدرسة موستر"},"description":{"en":"Muster School is a demo institution used to showcase the platform features with realistic mocked data.","fr":"Ecole Muster est un etablissement de demonstration utilise pour illustrer les fonctionnalites de la plateforme avec des donnees fictives realistes.","ar":"مدرسة موستر هي مؤسسة تجريبية تستخدم لعرض ميزات المنصة ببيانات وهمية واقعية."}},"adresse":{"en":"12 Musterstrasse, Berlin","fr":"12 Rue Muster, Berlin","ar":"12 شارع موستر، برلين"},"phone":"+49 30 1234567","mail":"contact@muster-school.de","primaryColor":"#7c3aed","accentColor":"#a855f7","softColor":"#f3e8ff","customerVersion":"silver","footerText":"(c) 2025 Muster School. All rights reserved."}');

-- Insert test users with roles
INSERT IGNORE INTO tb_user (userno,civilite, surname, firstname, email, adresse, password, role, school_id) VALUES
(1, 'Mr','admin', 'Gardinia', 'admin@school.com', 'Admin Street', 'Youssef83#', 'manager', 'gardinia'),
(2, 'Mr','parent','Parent', 'parent@school.com', 'Parent Street', 'parentpass', 'parent', 'gardinia'),
(3, 'Mr','student', 'Student', 'student@school.com', 'Student Street', 'studentpass', 'student', 'gardinia'),
(4, 'Mr','admin','Qods', 'manager@school.com', 'Manager Street', 'Halima68#', 'manager', 'qods'),
(5, 'Mr','teacher', 'Teacher', 'teacher@school.com', 'Teacher Street', 'teacherpass', 'teacher', 'qods'),
(6, 'Mr','finance','Finance', 'finance@school.com', 'Finance Street', 'financepass', 'finance', 'qods');

-- Gardinia teacher accounts used by the teacher and secretary services.
INSERT IGNORE INTO tb_user (userno, civilite, surname, firstname, email, adresse, password, role, school_id) VALUES
(201, 'Mr','Alami', 'Karim', 'karim.alami@school.com', 'Enseignant - Mathématiques', 'teacherpass', 'teacher', 'gardinia'),
(202,'Mme', 'Benjelloun' , 'Salma', 'salma.benjelloun@school.com', 'Enseignante - Mathématiques', 'teacherpass', 'teacher', 'gardinia'),
(203, 'Mr','Ouazzani','Yassine', 'yassine.ouazzani@school.com', 'Enseignant - Mathématiques', 'teacherpass', 'teacher', 'gardinia'),
(204, 'Mme' ,'Ziani', 'Nadia', 'nadia.ziani@school.com', 'Enseignante - Français', 'teacherpass', 'teacher', 'gardinia'),
(205,'Mr', 'Belhaj', 'Omar', 'omar.belhaj@school.com', 'Enseignant - Français', 'teacherpass', 'teacher', 'gardinia');




-- Gardinia student accounts matching the secretary, student, parent, and finance seeds.
INSERT IGNORE INTO tb_user (userno, civilite, surname, firstname, email, adresse, password, role, school_id) VALUES
(301, 'Mr',  'El Amrani', 'Adam', 'adam.elamrani@school.com', 'Eleve - classe 1', 'studentpass', 'student', 'gardinia'),
(302, 'Mme' ,'Bennani', 'Aya', 'aya.bennani@school.com', 'Eleve - classe 1', 'studentpass', 'student', 'gardinia'),
(303, 'Mr', 'Alaoui','Bilal', 'bilal.alaoui@school.com', 'Eleve - classe 1', 'studentpass', 'student', 'gardinia'),
(304,'Mme' , 'Idrissi', 'Chaimae', 'chaimae.idrissi@school.com', 'Eleve - classe 1', 'studentpass', 'student', 'gardinia'),
(305, 'Mme' ,'Fassi', 'Dounia', 'dounia.fassi@school.com', 'Eleve - classe 1', 'studentpass', 'student', 'gardinia'),
(306, 'Mr', 'Naciri','Elias', 'elias.naciri@school.com', 'Eleve - classe 1', 'studentpass', 'student', 'gardinia'),
(307,'Mme' , 'Zahraoui', 'Fatima', 'fatima.zahraoui@school.com', 'Eleve - classe 1', 'studentpass', 'student', 'gardinia'),
(308, 'Mr', 'Tazi','Hamza', 'hamza.tazi@school.com', 'Eleve - classe 1', 'studentpass', 'student', 'gardinia'),
(309, 'Mme' ,'Berrada', 'Imane', 'imane.berrada@school.com', 'Eleve - classe 1', 'studentpass', 'student', 'gardinia'),
(310, 'Mr', 'Chraibi','Jad', 'jad.chraibi@school.com', 'Eleve - classe 1', 'studentpass', 'student', 'gardinia');
