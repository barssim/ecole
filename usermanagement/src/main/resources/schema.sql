-- Tenant master table
CREATE TABLE IF NOT EXISTS tb_tenant (
    tenant_id VARCHAR(64) PRIMARY KEY,
    tenant_name VARCHAR(128) NOT NULL,
    CONSTRAINT uq_tb_tenant_name UNIQUE (tenant_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create tb_user table with role support for multiple roles (comma-separated)
CREATE TABLE IF NOT EXISTS tb_user (
    userno INT AUTO_INCREMENT PRIMARY KEY,
    role VARCHAR(255) COMMENT 'Comma-separated list of roles (e.g., "parent,admin")',
    tenant_id VARCHAR(64) NOT NULL,
    surname VARCHAR(255) NOT NULL,
    firstname VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    adresse VARCHAR(255),
    password VARCHAR(255) NOT NULL,
    CONSTRAINT fk_tb_user_tenant FOREIGN KEY (tenant_id) REFERENCES tb_tenant (tenant_id),
    CONSTRAINT uq_tb_user_tenant_email UNIQUE (tenant_id, email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create indexes for better query performance
CREATE INDEX idx_surname ON tb_user(surname);
CREATE INDEX idx_email ON tb_user(email);
CREATE INDEX idx_tenant_id ON tb_user(tenant_id);

