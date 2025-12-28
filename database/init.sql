-- Crear base de datos
CREATE DATABASE IF NOT EXISTS erp_db;
USE erp_db;

-- Tabla de usuarios para autenticación
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Índice para búsqueda por email
CREATE INDEX idx_users_email ON users(email);

-- Tabla de refresh tokens para gestión de sesiones
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token VARCHAR(500) NOT NULL UNIQUE,
    device_info VARCHAR(255) NULL,
    ip_address VARCHAR(45) NULL,
    expires_at TIMESTAMP NOT NULL,
    is_revoked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    revoked_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Índices para refresh_tokens
CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX idx_refresh_tokens_expires ON refresh_tokens(expires_at);

-- Tabla de blacklist para access tokens invalidados (logout antes de expiración)
CREATE TABLE IF NOT EXISTS token_blacklist (
    id INT AUTO_INCREMENT PRIMARY KEY,
    token_jti VARCHAR(255) NOT NULL UNIQUE,
    user_id INT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Índice para búsqueda rápida en blacklist
CREATE INDEX idx_token_blacklist_jti ON token_blacklist(token_jti);
CREATE INDEX idx_token_blacklist_expires ON token_blacklist(expires_at);

-- Evento para limpiar tokens expirados automáticamente (ejecutar cada día)
-- Nota: Requiere que el event_scheduler esté habilitado: SET GLOBAL event_scheduler = ON;
DELIMITER //
CREATE EVENT IF NOT EXISTS cleanup_expired_tokens
ON SCHEDULE EVERY 1 DAY
DO
BEGIN
    DELETE FROM refresh_tokens WHERE expires_at < NOW();
    DELETE FROM token_blacklist WHERE expires_at < NOW();
END//
DELIMITER ;
