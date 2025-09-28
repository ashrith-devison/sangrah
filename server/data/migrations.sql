
-- Table for user file info with tags, starred, permission, etc.
CREATE TABLE IF NOT EXISTS user_file_info (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    filename VARCHAR(255) NOT NULL,
    tags VARCHAR(16) CHECK (tags IN ('high', 'medium', 'low')) DEFAULT 'medium',
    upload_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    starred BOOLEAN DEFAULT FALSE,
    permission VARCHAR(16) CHECK (permission IN ('owner', 'read')) DEFAULT 'owner',
    CONSTRAINT user_file_info_unique UNIQUE (username, filename)
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS file_metadata (
    sha256 VARCHAR(64) PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    mime_type VARCHAR(128) NOT NULL,
    path TEXT NOT NULL,
    reference_id VARCHAR(64) NOT NULL,
    reference_count INT DEFAULT 1,
    file_size FLOAT NOT NULL
);

CREATE TABLE IF NOT EXISTS user_files (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL REFERENCES users(username) ON DELETE CASCADE,
    file_id VARCHAR(64) NOT NULL REFERENCES file_metadata(sha256) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    path TEXT,
    permission VARCHAR(32) NOT NULL DEFAULT 'owner',
    shared_with VARCHAR(255),
    shared_by VARCHAR(255),
    is_public BOOLEAN DEFAULT FALSE,
    download_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Unique constraint for file sharing (owner, file_id, shared_with, shared_by)
ALTER TABLE user_files ADD CONSTRAINT unique_file_share UNIQUE (file_id, username, shared_with);

CREATE INDEX IF NOT EXISTS idx_file_metadata_filename ON file_metadata(filename);
CREATE INDEX IF NOT EXISTS idx_file_metadata_mime_type ON file_metadata(mime_type);
CREATE INDEX IF NOT EXISTS idx_file_metadata_file_size ON file_metadata(file_size);
CREATE INDEX IF NOT EXISTS idx_user_files_filename ON user_files(filename);
CREATE INDEX IF NOT EXISTS idx_user_files_created_at ON user_files(created_at);


-- Public shares table for token-based sharing
CREATE TABLE IF NOT EXISTS public_shares (
    id SERIAL PRIMARY KEY,
    token VARCHAR(128) UNIQUE NOT NULL,
    file_id VARCHAR(64) NOT NULL REFERENCES file_metadata(sha256) ON DELETE CASCADE,
    username VARCHAR(255) NOT NULL REFERENCES users(username) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_public_shares_token ON public_shares(token);
