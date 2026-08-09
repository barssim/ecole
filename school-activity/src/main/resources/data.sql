INSERT IGNORE INTO tb_school_activity
(id, tenant_id, type, title, date, class_name, destination, description, created_by)
VALUES
(1, 'gardinia', 'sorties', 'Besuch im Naturkundemuseum', '2026-09-15', '3e A', 'Naturkundemuseum', 'Gefuehrte Exkursion fuer den Biologieunterricht.', 'secretary'),
(2, 'gardinia', 'fetes', 'Schulstart-Feier', '2026-09-20', '3e B', 'Schulhof', 'Begruessung der neuen Schuelerinnen und Schueler.', 'secretary'),
(3, 'gardinia', 'reunions', 'Informationsabend Eltern', '2026-10-02', 'Terminale C', 'Saal B1', 'Austausch zu Lernzielen und Pruefungen im 1. Trimester.', 'secretary');

