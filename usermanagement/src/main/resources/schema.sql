-- Create tb_user table with role support for multiple roles (comma-separated)
CREATE TABLE IF NOT EXISTS tb_user (
    userno INT AUTO_INCREMENT PRIMARY KEY,
    role VARCHAR(255) COMMENT 'Comma-separated list of roles (e.g., "parent,admin")',
    surname VARCHAR(255) NOT NULL,
    firstname VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    adresse VARCHAR(255),
    password VARCHAR(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create indexes for better query performance
CREATE INDEX idx_surname ON tb_user(surname);
CREATE INDEX idx_email ON tb_user(email);

