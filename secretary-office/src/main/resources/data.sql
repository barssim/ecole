INSERT IGNORE INTO tb_attestation
(id, tenant_id, user_id, student_name, class_name, title, type, date, status, document_url, issued_by, valid_from, valid_until, reference)
VALUES
(1, 'gardinia', 5, 'Assil', '3e A', 'Attestation de scolarité', 'enrollment', '2024-09-01', 'approved', NULL, 'Directeur de l''école', '2024-09-01', '2025-08-31', 'ATT-2024-001-5'),
(2, 'gardinia', 5, 'Assil', '3e A', 'Attestation de présence', 'attendance', '2025-01-15', 'approved', NULL, 'Coordinatrice pédagogique', '2025-01-01', '2025-12-31', 'ATT-2025-002-5'),
(3, 'gardinia', 5, 'Assil', '3e A', 'Attestation d''inscription', 'registration', '2025-03-22', 'pending', NULL, 'Secrétariat', '2025-03-22', '2026-03-22', 'ATT-2025-003-5'),
(4, 'gardinia', 6, 'Barae', '3e B', 'Attestation de scolarité', 'enrollment', '2024-09-01', 'approved', NULL, 'Directeur de l''école', '2024-09-01', '2025-08-31', 'ATT-2024-001-6'),
(5, 'gardinia', 6, 'Barae', '3e B', 'Attestation de résultats académiques', 'academic', '2025-06-15', 'approved', NULL, 'Chef du département académique', '2025-06-15', '2025-12-31', 'ATT-2025-005-6'),
(6, 'gardinia', 7, 'Tasnim', 'Terminale C', 'Attestation de scolarité', 'enrollment', '2024-09-01', 'approved', NULL, 'Directeur de l''école', '2024-09-01', '2025-08-31', 'ATT-2024-001-7');

INSERT IGNORE INTO tb_class (id, tenant_id, name)
VALUES
(1, 'gardinia', '3e A'),
(2, 'gardinia', '3e B'),
(3, 'gardinia', '4e A'),
(4, 'gardinia', '4e B'),
(5, 'gardinia', '5e A'),
(6, 'gardinia', '5e B'),
(7, 'gardinia', '6e A'),
(8, 'gardinia', '6e B');

INSERT IGNORE INTO tb_class_student (class_id, student_name)
VALUES
(1, 'Adam El Amrani'),
(1, 'Aya Bennani'),
(1, 'Bilal Alaoui'),
(1, 'Chaimae Idrissi'),
(1, 'Dounia Fassi'),
(1, 'Elias Naciri'),
(1, 'Fatima Zahraoui'),
(1, 'Hamza Tazi'),
(1, 'Imane Berrada'),
(1, 'Jad Chraibi'),
(1, 'Khadija Rami'),
(1, 'Lina Mansouri'),
(1, 'Mehdi Saidi'),
(2, 'Nada Amrani'),
(2, 'Omar Bennani'),
(2, 'Rania Alaoui'),
(2, 'Sami Idrissi'),
(2, 'Sara Fassi'),
(2, 'Youssef Naciri'),
(2, 'Zineb Tazi'),
(2, 'Anas Berrada'),
(2, 'Basma Chraibi'),
(2, 'Camil Rami'),
(2, 'Hiba Mansouri'),
(2, 'Ilyas Saidi'),
(2, 'Malak Zahraoui'),
(3, 'Amine El Amrani'),
(3, 'Asma Bennani'),
(3, 'Ayoub Alaoui'),
(3, 'Doha Idrissi'),
(3, 'Hajar Fassi'),
(3, 'Ismail Naciri'),
(3, 'Kenza Tazi'),
(3, 'Marouane Berrada'),
(3, 'Meryem Chraibi'),
(3, 'Nabil Rami'),
(3, 'Nour Mansouri'),
(3, 'Rayane Saidi'),
(3, 'Salma Zahraoui'),
(4, 'Amina El Amrani'),
(4, 'Ayoub Bennani'),
(4, 'Badr Alaoui'),
(4, 'Dalia Idrissi'),
(4, 'Hassan Fassi'),
(4, 'Ikram Naciri'),
(4, 'Jalal Tazi'),
(4, 'Kawtar Berrada'),
(4, 'Maha Chraibi'),
(4, 'Nassim Rami'),
(4, 'Oumaima Mansouri'),
(4, 'Soufiane Saidi'),
(4, 'Wiam Zahraoui'),
(5, 'Ahlam El Amrani'),
(5, 'Anas Bennani'),
(5, 'Brahim Alaoui'),
(5, 'Farah Idrissi'),
(5, 'Ghita Fassi'),
(5, 'Hamid Naciri'),
(5, 'Ibtissam Tazi'),
(5, 'Kamal Berrada'),
(5, 'Loubna Chraibi'),
(5, 'Mouad Rami'),
(5, 'Najat Mansouri'),
(5, 'Othmane Saidi'),
(6, 'Adil Zahraoui'),
(6, 'Amal El Amrani'),
(6, 'Bouchra Bennani'),
(6, 'Fouad Alaoui'),
(6, 'Houda Idrissi'),
(6, 'Ibrahim Fassi'),
(6, 'Leila Naciri'),
(6, 'Mounir Tazi'),
(6, 'Nawal Berrada'),
(6, 'Reda Chraibi'),
(6, 'Samira Rami'),
(6, 'Zakaria Mansouri'),
(7, 'Achraf Saidi'),
(7, 'Aya Zahraoui'),
(7, 'Chaymae El Amrani'),
(7, 'Driss Bennani'),
(7, 'Esmae Alaoui'),
(7, 'Faris Idrissi'),
(7, 'Houda Fassi'),
(7, 'Soumaya Naciri'),
(7, 'Jihane Tazi'),
(7, 'Khalil Berrada'),
(7, 'Meriem Chraibi'),
(7, 'Siham Rami'),
(8, 'Abir Mansouri'),
(8, 'Ayoub Saidi'),
(8, 'Basma Zahraoui'),
(8, 'Hamza El Amrani'),
(8, 'Ines Bennani'),
(8, 'Jad Alaoui'),
(8, 'Khadija Idrissi'),
(8, 'Lamia Fassi'),
(8, 'Meryem Naciri'),
(8, 'Oussama Tazi'),
(8, 'Sara Berrada'),
(8, 'Yasmine Chraibi');

INSERT IGNORE INTO tb_class_teacher (class_id, teacher_name)
VALUES
(1, 'Mme Benali'),
(2, 'M. Alaoui'),
(3, 'Mme Idrissi'),
(4, 'M. Chraibi'),
(5, 'Mme Fassi'),
(6, 'M. Naciri'),
(7, 'Mme Tazi'),
(8, 'M. Berrada');

INSERT IGNORE INTO tb_class_teacher (class_id, teacher_name)
VALUES
(1, 'benali'),
(2, 'alaoui'),
(3, 'idrissi'),
(4, 'chraibi'),
(5, 'fassi'),
(6, 'naciri'),
(7, 'tazi'),
(8, 'berrada');

INSERT IGNORE INTO tb_activity
(id, tenant_id, type, title, date, class_name, destination, description, created_by)
VALUES
(1, 'gardinia', 'sorties', 'Sortie pédagogique au musée', '2026-09-12', '3e A', 'Musée des sciences', 'Sortie encadrée pour découverte scientifique.', 'secretary'),
(2, 'gardinia', 'fetes', 'Fête de rentrée', '2026-09-20', '3e B', 'Cour principale', 'Activité festive de bienvenue.', 'secretary'),
(3, 'gardinia', 'reunions', 'Réunion parents-professeurs', '2026-10-05', 'Terminale C', 'Salle A2', 'Point trimestriel avec les familles.', 'secretary'),
(4, 'gardinia', 'sorties', 'Sortie culturelle au musée d''histoire', '2026-10-14', '3e A', 'Musée d''histoire et civilisation', 'Découverte du patrimoine culturel national.', 'secretary'),
(5, 'gardinia', 'sorties', 'Sortie sportive en plein air', '2026-10-21', '4e A', 'Complexe sportif municipal', 'Journée multisports pour renforcer la cohésion de classe.', 'secretary'),
(6, 'gardinia', 'sorties', 'Sortie scientifique au planétarium', '2026-11-04', '5e A', 'Planétarium et observatoire', 'Initiation à l''astronomie et découverte du système solaire.', 'secretary'),
(7, 'gardinia', 'sorties', 'Sortie artistique au théâtre', '2026-11-18', '6e A', 'Théâtre municipal', 'Représentation théâtrale suivie d''un atelier d''expression artistique.', 'secretary'),
(8, 'gardinia', 'sorties', 'Sortie écologique à la ferme pédagogique', '2026-12-02', '4e B', 'Ferme pédagogique régionale', 'Sensibilisation à l''environnement et à l''agriculture durable.', 'secretary'),
(9, 'gardinia', 'fetes', 'Fête de fin d''année', '2027-06-20', '6e B', 'Cour principale', 'Cérémonie festive de clôture de l''année scolaire.', 'secretary'),
(10, 'gardinia', 'fetes', 'Fête de l''Achoura', '2026-09-28', '3e A', 'Salle polyvalente', 'Célébration culturelle et religieuse avec les élèves.', 'secretary'),
(11, 'gardinia', 'fetes', 'Fête de l''Indépendance', '2026-11-18', '5e A', 'Cour principale', 'Commémoration nationale avec chants et déclamations.', 'secretary'),
(12, 'gardinia', 'fetes', 'Fête du Nouvel An', '2026-12-31', '4e B', 'Salle polyvalente', 'Célébration conviviale de fin d''année civile.', 'secretary'),
(13, 'gardinia', 'reunions', 'Réunion du conseil de classe', '2026-10-12', '3e A', 'Salle des professeurs', 'Bilan pédagogique du premier trimestre.', 'secretary'),
(14, 'gardinia', 'reunions', 'Réunion pédagogique des enseignants', '2026-10-19', '4e A', 'Salle A3', 'Coordination des programmes entre enseignants.', 'secretary'),
(15, 'gardinia', 'reunions', 'Réunion parents-professeurs 5e année', '2026-11-09', '5e A', 'Salle B1', 'Suivi individuel des élèves de 5e année.', 'secretary'),
(16, 'gardinia', 'reunions', 'Réunion du conseil d''administration', '2026-11-16', '6e A', 'Bureau du directeur', 'Décisions administratives et budgétaires.', 'secretary'),
(17, 'gardinia', 'reunions', 'Réunion d''orientation scolaire', '2026-12-07', '6e B', 'Salle A2', 'Information sur les filières et l''orientation.', 'secretary'),
(18, 'gardinia', 'reunions', 'Réunion de rentrée avec les parents', '2026-09-15', '3e B', 'Amphithéâtre', 'Présentation du projet pédagogique annuel.', 'secretary'),
(19, 'gardinia', 'reunions', 'Réunion bilan de fin de trimestre', '2027-01-11', 'Terminale C', 'Salle A2', 'Évaluation des résultats du premier trimestre.', 'secretary');

INSERT IGNORE INTO tb_exam
(id, tenant_id, subject, class_name, date, start_time, end_time, room, notes)
VALUES
(1, 'gardinia', 'Mathématiques', '3e A', '2026-08-05', '08:00:00', '10:00:00', 'Salle 101', NULL),
(2, 'gardinia', 'Français',      '3e B', '2026-08-06', '09:00:00', '11:00:00', 'Salle 102', NULL),
(3, 'gardinia', 'Sciences',      '3e A', '2026-08-07', '10:00:00', '12:00:00', 'Salle 103', NULL),
(4, 'gardinia', 'Histoire',      'Terminale C', '2026-08-08', '08:30:00', '10:30:00', 'Amphithéâtre', NULL);

INSERT IGNORE INTO tb_professor_attendance
(id, tenant_id, teacher_id, teacher_name, attendance_date, scheduled_time, check_in_time, status, notes, updated_at)
VALUES
(1, 'gardinia', 101, 'Mme Benali', '2026-09-19', '08:00:00', '07:55:00', 'present', 'Cours de mathématiques', '2026-09-19 07:55:00'),
(2, 'gardinia', 102, 'M. Alaoui', '2026-09-19', '08:30:00', '08:40:00', 'late', 'Retard signalé', '2026-09-19 08:40:00'),
(3, 'gardinia', 103, 'Mme Idrissi', '2026-09-19', '09:00:00', NULL, 'absent', 'Absence déclarée', '2026-09-19 08:15:00'),
(4, 'gardinia', 104, 'M. Chraibi', '2026-09-19', '08:00:00', '07:58:00', 'present', 'Cours de français', '2026-09-19 07:58:00'),
(5, 'gardinia', 105, 'Mme Fassi', '2026-09-19', '08:00:00', '08:20:00', 'late', 'Retard dû à un embouteillage', '2026-09-19 08:20:00'),
(6, 'gardinia', 106, 'M. Naciri', '2026-09-19', '09:00:00', NULL, 'absent', 'Congé maladie', '2026-09-19 08:30:00'),
(7, 'gardinia', 107, 'Mme Tazi', '2026-09-19', '08:30:00', '08:28:00', 'present', 'Cours d''éducation islamique', '2026-09-19 08:28:00'),
(8, 'gardinia', 108, 'M. Berrada', '2026-09-19', '09:30:00', '09:45:00', 'late', 'Retard signalé au secrétariat', '2026-09-19 09:45:00'),
(9, 'gardinia', 201, 'Karim Alami', '2026-09-19', '08:00:00', '07:57:00', 'present', 'Cours de mathématiques', '2026-09-19 07:57:00'),
(10, 'gardinia', 204, 'Nadia Ziani', '2026-09-19', '08:00:00', NULL, 'absent', 'Absence non justifiée', '2026-09-19 08:10:00'),
(11, 'gardinia', 207, 'Rachid Filali', '2026-09-19', '09:00:00', '09:12:00', 'late', 'Retard signalé', '2026-09-19 09:12:00'),
(12, 'gardinia', 210, 'Hind Iraqi', '2026-09-19', '10:00:00', '09:58:00', 'present', 'Cours d''anglais', '2026-09-19 09:58:00'),
(13, 'gardinia', 213, 'Anouar Lahlou', '2026-09-19', '10:30:00', NULL, 'absent', 'Congé personnel', '2026-09-19 10:00:00'),
(14, 'gardinia', 216, 'Meryem Ouahbi', '2026-09-19', '08:00:00', '08:05:00', 'present', 'Cours de physique-chimie', '2026-09-19 08:05:00'),
(15, 'gardinia', 219, 'Tarik Saadi', '2026-09-19', '08:30:00', '08:50:00', 'late', 'Retard signalé', '2026-09-19 08:50:00'),
(16, 'gardinia', 222, 'Rim Wahbi', '2026-09-19', '09:00:00', '08:59:00', 'present', 'Cours d''éducation islamique', '2026-09-19 08:59:00'),
(17, 'gardinia', 225, 'Amine Aissaoui', '2026-09-19', '10:00:00', NULL, 'absent', 'Absence déclarée', '2026-09-19 09:30:00'),
(18, 'gardinia', 228, 'Hafsa Draoui', '2026-09-19', '11:00:00', '11:03:00', 'present', 'Cours d''arts plastiques', '2026-09-19 11:03:00');

-- Backfill legacy rows created before tenant support.
UPDATE tb_class SET tenant_id = 'gardinia' WHERE tenant_id IS NULL OR tenant_id = '';
UPDATE tb_attestation SET tenant_id = 'gardinia' WHERE tenant_id IS NULL OR tenant_id = '';
UPDATE tb_activity SET tenant_id = 'gardinia' WHERE tenant_id IS NULL OR tenant_id = '';
UPDATE tb_exam SET tenant_id = 'gardinia' WHERE tenant_id IS NULL OR tenant_id = '';
UPDATE tb_professor_attendance SET tenant_id = 'gardinia' WHERE tenant_id IS NULL OR tenant_id = '';
