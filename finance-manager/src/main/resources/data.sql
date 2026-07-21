-- Disable foreign key checks during bulk insert
SET FOREIGN_KEY_CHECKS=0;

-- Truncate tables to ensure clean state
TRUNCATE TABLE tb_payments;
TRUNCATE TABLE tb_payment_notices;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS=1;

-- Insert sample payment data
INSERT INTO tb_payments (id, student_name, class_name, amount, currency, method, payment_date, reference, notes) VALUES
(1, 'Yasmine El Idrissi', '5ème année', 1500.00, 'MAD', 'card', '2025-07-06', 'REF-2025-07-001', 'Tuition payment for July'),
(2, 'Ahmed Bennani', '4ème année', 1200.00, 'MAD', 'transfer', '2025-07-05', 'REF-2025-07-002', 'School fees'),
(3, 'Fatima Zahra Mansouri', '3ème année', 1000.00, 'MAD', 'cash', '2025-07-03', 'REF-2025-07-003', 'Monthly tuition'),
(4, 'Mohammed Al-Khami', '6ème année', 2000.00, 'MAD', 'card', '2025-06-30', 'REF-2025-06-001', 'Extended payment plan'),
(5, 'Layla Rachidi', '1ère année', 1500.00, 'MAD', 'transfer', '2025-06-28', 'REF-2025-06-002', 'June payment'),
(6, 'Ibrahim Tazi', '2ème année', 800.00, 'MAD', 'cash', '2025-06-25', 'REF-2025-06-003', 'Partial payment'),
(7, 'Nadia Bennani', '5ème année', 1500.00, 'MAD', 'card', '2025-06-20', 'REF-2025-06-004', 'Full monthly payment'),
(8, 'Hassan El Fassi', '4ème année', 1200.00, 'MAD', 'transfer', '2025-06-18', 'REF-2025-06-005', 'Tuition fees'),
(9, 'Amina Alaoui', '3ème année', 1500.00, 'MAD', 'card', '2025-06-15', 'REF-2025-06-006', 'School tuition'),
(10, 'Salim Kasmi', '2ème année', 950.00, 'MAD', 'cash', '2025-06-10', 'REF-2025-06-007', 'Installment payment');

-- Insert sample payment notice data
INSERT INTO tb_payment_notices (id, invoice_number, invoice_date, due_date, student_name, class_name, total_amount, currency, status, description, paid_date) VALUES
(1, 'INV-2025-07-001', '2025-07-01', '2025-07-15', 'Yasmine El Idrissi', '5ème année', 1500.00, 'MAD', 'paid', 'July 2025 Tuition', '2025-07-06'),
(2, 'INV-2025-07-002', '2025-07-01', '2025-07-15', 'Ahmed Bennani', '4ème année', 1200.00, 'MAD', 'paid', 'July 2025 School Fees', '2025-07-05'),
(3, 'INV-2025-07-003', '2025-07-01', '2025-07-20', 'Fatima Zahra Mansouri', '3ème année', 1000.00, 'MAD', 'pending', 'July 2025 Monthly Fees', NULL),
(4, 'INV-2025-07-004', '2025-07-02', '2025-07-25', 'Mohammed Al-Khami', '6ème année', 2000.00, 'MAD', 'pending', 'Extended Session Fees', NULL),
(5, 'INV-2025-07-005', '2025-07-03', '2025-07-18', 'Layla Rachidi', '1ère année', 1500.00, 'MAD', 'partially_paid', 'July 2025 Tuition', '2025-07-05'),
(6, 'INV-2025-06-001', '2025-06-01', '2025-06-15', 'Ibrahim Tazi', '2ème année', 800.00, 'MAD', 'paid', 'June 2025 Fees', '2025-06-25'),
(7, 'INV-2025-06-002', '2025-06-02', '2025-06-20', 'Nadia Bennani', '5ème année', 1500.00, 'MAD', 'paid', 'June 2025 Tuition', '2025-06-20'),
(8, 'INV-2025-06-003', '2025-06-05', '2025-06-22', 'Hassan El Fassi', '4ème année', 1200.00, 'MAD', 'paid', 'June 2025 School Fees', '2025-06-18'),
(9, 'INV-2025-06-004', '2025-06-10', '2025-06-30', 'Amina Alaoui', '3ème année', 1500.00, 'MAD', 'paid', 'June 2025 Tuition', '2025-06-15'),
(10, 'INV-2025-05-001', '2025-05-15', '2025-06-01', 'Salim Kasmi', '2ème année', 950.00, 'MAD', 'overdue', 'May 2025 Fees', NULL);

-- Update auto-increment counters to avoid conflicts
ALTER TABLE tb_payments AUTO_INCREMENT = 11;
ALTER TABLE tb_payment_notices AUTO_INCREMENT = 11;

