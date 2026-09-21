-- School master table
CREATE TABLE IF NOT EXISTS tb_school (
    school_id VARCHAR(64) PRIMARY KEY,
    school_name VARCHAR(128) NOT NULL,
    school_email VARCHAR(255) NULL,
    CONSTRAINT uq_tb_school_name UNIQUE (school_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create tb_user table with role support for multiple roles (comma-separated)
CREATE TABLE IF NOT EXISTS tb_user (
    userno INT AUTO_INCREMENT PRIMARY KEY,
    role VARCHAR(255) COMMENT 'Comma-separated list of roles (e.g., "parent,admin")',
    school_id VARCHAR(64) NOT NULL,
    civilite VARCHAR(20) COMMENT 'Monsieur / Madame',
    surname VARCHAR(255) NOT NULL,
    firstname VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    adresse VARCHAR(255),
    password VARCHAR(255) NOT NULL,
    CONSTRAINT fk_tb_user_school FOREIGN KEY (school_id) REFERENCES tb_school (school_id),
    CONSTRAINT uq_tb_user_school_email UNIQUE (school_id, email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Store school-specific UI customization variables as JSON
CREATE TABLE IF NOT EXISTS tb_school_customization (
    school_id VARCHAR(64) PRIMARY KEY,
    customization_json TEXT NOT NULL,
    CONSTRAINT fk_tb_school_customization_school FOREIGN KEY (school_id) REFERENCES tb_school (school_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


