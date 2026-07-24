-- Insert sample payment data (only if not already present)
INSERT IGNORE INTO tb_payments (id, tenant_id, student_name, class_name, amount, currency, method, payment_date, reference, notes) VALUES
(1, 'gardinia', 'Yasmine El Idrissi', '5ème année', 1500.00, 'MAD', 'card', '2025-07-06', 'REF-2025-07-001', 'Tuition payment for July'),
(2, 'gardinia', 'Ahmed Bennani', '4ème année', 1200.00, 'MAD', 'transfer', '2025-07-05', 'REF-2025-07-002', 'School fees'),
(3, 'gardinia', 'Fatima Zahra Mansouri', '3ème année', 1000.00, 'MAD', 'cash', '2025-07-03', 'REF-2025-07-003', 'Monthly tuition'),
(4, 'gardinia', 'Mohammed Al-Khami', '6ème année', 2000.00, 'MAD', 'card', '2025-06-30', 'REF-2025-06-001', 'Extended payment plan'),
(5, 'gardinia', 'Layla Rachidi', '1ère année', 1500.00, 'MAD', 'transfer', '2025-06-28', 'REF-2025-06-002', 'June payment'),
(6, 'gardinia', 'Ibrahim Tazi', '2ème année', 800.00, 'MAD', 'cash', '2025-06-25', 'REF-2025-06-003', 'Partial payment'),
(7, 'gardinia', 'Nadia Bennani', '5ème année', 1500.00, 'MAD', 'card', '2025-06-20', 'REF-2025-06-004', 'Full monthly payment'),
(8, 'gardinia', 'Hassan El Fassi', '4ème année', 1200.00, 'MAD', 'transfer', '2025-06-18', 'REF-2025-06-005', 'Tuition fees'),
(9, 'gardinia', 'Amina Alaoui', '3ème année', 1500.00, 'MAD', 'card', '2025-06-15', 'REF-2025-06-006', 'School tuition'),
(10, 'gardinia', 'Salim Kasmi', '2ème année', 950.00, 'MAD', 'cash', '2025-06-10', 'REF-2025-06-007', 'Installment payment');

-- Insert sample payment notice data (only if not already present)
INSERT IGNORE INTO tb_payment_notices (id, tenant_id, invoice_number, invoice_date, due_date, student_name, class_name, total_amount, currency, status, description, paid_date) VALUES
(1, 'gardinia', 'INV-2025-07-001', '2025-07-01', '2025-07-15', 'Yasmine El Idrissi', '5ème année', 1500.00, 'MAD', 'paid', 'July 2025 Tuition', '2025-07-06'),
(2, 'gardinia', 'INV-2025-07-002', '2025-07-01', '2025-07-15', 'Ahmed Bennani', '4ème année', 1200.00, 'MAD', 'paid', 'July 2025 School Fees', '2025-07-05'),
(3, 'gardinia', 'INV-2025-07-003', '2025-07-01', '2025-07-20', 'Fatima Zahra Mansouri', '3ème année', 1000.00, 'MAD', 'pending', 'July 2025 Monthly Fees', NULL),
(4, 'gardinia', 'INV-2025-07-004', '2025-07-02', '2025-07-25', 'Mohammed Al-Khami', '6ème année', 2000.00, 'MAD', 'pending', 'Extended Session Fees', NULL),
(5, 'gardinia', 'INV-2025-07-005', '2025-07-03', '2025-07-18', 'Layla Rachidi', '1ère année', 1500.00, 'MAD', 'partially_paid', 'July 2025 Tuition', '2025-07-05'),
(6, 'gardinia', 'INV-2025-06-001', '2025-06-01', '2025-06-15', 'Ibrahim Tazi', '2ème année', 800.00, 'MAD', 'paid', 'June 2025 Fees', '2025-06-25'),
(7, 'gardinia', 'INV-2025-06-002', '2025-06-02', '2025-06-20', 'Nadia Bennani', '5ème année', 1500.00, 'MAD', 'paid', 'June 2025 Tuition', '2025-06-20'),
(8, 'gardinia', 'INV-2025-06-003', '2025-06-05', '2025-06-22', 'Hassan El Fassi', '4ème année', 1200.00, 'MAD', 'paid', 'June 2025 School Fees', '2025-06-18'),
(9, 'gardinia', 'INV-2025-06-004', '2025-06-10', '2025-06-30', 'Amina Alaoui', '3ème année', 1500.00, 'MAD', 'paid', 'June 2025 Tuition', '2025-06-15'),
(10, 'gardinia', 'INV-2025-05-001', '2025-05-15', '2025-06-01', 'Salim Kasmi', '2ème année', 950.00, 'MAD', 'overdue', 'May 2025 Fees', NULL);

-- Backfill legacy rows created before tenant support.
UPDATE tb_payments SET tenant_id = 'gardinia' WHERE tenant_id IS NULL OR tenant_id = '';
UPDATE tb_payment_notices SET tenant_id = 'gardinia' WHERE tenant_id IS NULL OR tenant_id = '';
UPDATE tb_factures SET tenant_id = 'gardinia' WHERE tenant_id IS NULL OR tenant_id = '';


