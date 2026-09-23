INSERT INTO tb_payments
(id, school_id, student_name, class_name, amount, currency, method, payment_date, reference, notes) VALUES
(9501, 'muster', 'Adam', 'Class 1A', 1500.00, 'MAD', 'card', '2026-09-05', 'MUSTER-PAY-001', 'September tuition paid'),
(9502, 'muster', 'Amira', 'Class 1A', 750.00, 'MAD', 'transfer', '2026-09-06', 'MUSTER-PAY-002', 'First installment'),
(9503, 'muster', 'Bilal', 'Class 1A', 1500.00, 'MAD', 'cash', '2026-09-07', 'MUSTER-PAY-003', 'September tuition paid');

INSERT INTO tb_payment_notices
(id, school_id, invoice_number, invoice_date, due_date, student_name, class_name, total_amount, currency, status, description, paid_date) VALUES
(9511, 'muster', 'MUSTER-INV-001', '2026-09-01', '2026-09-15', 'Adam', 'Class 1A', 1500.00, 'MAD', 'paid', 'September tuition', '2026-09-05'),
(9512, 'muster', 'MUSTER-INV-002', '2026-09-01', '2026-09-15', 'Amira', 'Class 1A', 1500.00, 'MAD', 'partially_paid', 'September tuition', '2026-09-06'),
(9513, 'muster', 'MUSTER-INV-003', '2026-09-01', '2026-09-15', 'Chaima', 'Class 1A', 1500.00, 'MAD', 'overdue', 'September tuition', NULL);

INSERT INTO tb_factures
(id, school_id, invoice_number, student_name, class_name, total_amount, currency, generated_date, items_json) VALUES
(9521, 'muster', 'MUSTER-FAC-001', 'Adam', 'Class 1A', 1500.00, 'MAD', '2026-09-01', '[{"description":"Tuition September","quantity":1,"unitPrice":1500.0}]'),
(9522, 'muster', 'MUSTER-FAC-002', 'Amira', 'Class 1A', 1500.00, 'MAD', '2026-09-01', '[{"description":"Tuition September","quantity":1,"unitPrice":1500.0}]');
