-- Users table
CREATE TABLE IF NOT EXISTS users (
    username VARCHAR(255) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
);

-- File metadata table
CREATE TABLE IF NOT EXISTS file_metadata (
    sha256 VARCHAR(64) PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    mime_type VARCHAR(128) NOT NULL,
    path TEXT NOT NULL,
    reference_id VARCHAR(64) NOT NULL,
    reference_count INT DEFAULT 1,
    file_size FLOAT NOT NULL
);

-- User files table
CREATE TABLE IF NOT EXISTS user_files (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL REFERENCES users(username) ON DELETE CASCADE,
    file_id VARCHAR(64) NOT NULL REFERENCES file_metadata(sha256) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    permission VARCHAR(32) NOT NULL DEFAULT 'owner',
    shared_with VARCHAR(255),
    is_public BOOLEAN DEFAULT FALSE,
    download_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (username, file_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_file_metadata_filename ON file_metadata(filename);
CREATE INDEX IF NOT EXISTS idx_file_metadata_mime_type ON file_metadata(mime_type);
CREATE INDEX IF NOT EXISTS idx_file_metadata_file_size ON file_metadata(file_size);
CREATE INDEX IF NOT EXISTS idx_user_files_filename ON user_files(filename);
CREATE INDEX IF NOT EXISTS idx_user_files_created_at ON user_files(created_at);
