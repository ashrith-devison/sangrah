package tests

import (
	"database/sql"
	"testing"

	"github.com/DATA-DOG/go-sqlmock"
)

// GetMockDB returns a sql.DB and sqlmock.Sqlmock for use in tests
func GetMockDB(t *testing.T) (*sql.DB, sqlmock.Sqlmock) {
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("failed to open sqlmock database: %v", err)
	}
	return db, mock
}

// GetCreateTableQueries returns the SQL for creating all tables needed for tests
func GetCreateTableQueries() string {
	return `
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
ALTER TABLE user_files ADD CONSTRAINT unique_file_share UNIQUE (file_id, username, shared_with);

CREATE INDEX IF NOT EXISTS idx_file_metadata_filename ON file_metadata(filename);
CREATE INDEX IF NOT EXISTS idx_file_metadata_mime_type ON file_metadata(mime_type);
CREATE INDEX IF NOT EXISTS idx_file_metadata_file_size ON file_metadata(file_size);
CREATE INDEX IF NOT EXISTS idx_user_files_filename ON user_files(filename);
CREATE INDEX IF NOT EXISTS idx_user_files_created_at ON user_files(created_at);

CREATE TABLE IF NOT EXISTS public_shares (
    id SERIAL PRIMARY KEY,
    token VARCHAR(128) UNIQUE NOT NULL,
    file_id VARCHAR(64) NOT NULL REFERENCES file_metadata(sha256) ON DELETE CASCADE,
    username VARCHAR(255) NOT NULL REFERENCES users(username) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_public_shares_token ON public_shares(token);
`
}

// GetInitializedMockDB returns a sql.DB and sqlmock.Sqlmock with schema initialized
func GetInitializedMockDB(t *testing.T) (*sql.DB, sqlmock.Sqlmock) {
	db, mock := GetMockDB(t)
	mock.ExpectExec("CREATE TABLE IF NOT EXISTS user_file_info").WillReturnResult(sqlmock.NewResult(0, 0))
	mock.ExpectExec("CREATE TABLE IF NOT EXISTS users").WillReturnResult(sqlmock.NewResult(0, 0))
	mock.ExpectExec("CREATE TABLE IF NOT EXISTS file_metadata").WillReturnResult(sqlmock.NewResult(0, 0))
	mock.ExpectExec("CREATE TABLE IF NOT EXISTS user_files").WillReturnResult(sqlmock.NewResult(0, 0))
	mock.ExpectExec("ALTER TABLE user_files ADD CONSTRAINT unique_file_share").WillReturnResult(sqlmock.NewResult(0, 0))
	mock.ExpectExec("CREATE INDEX IF NOT EXISTS idx_file_metadata_filename").WillReturnResult(sqlmock.NewResult(0, 0))
	mock.ExpectExec("CREATE INDEX IF NOT EXISTS idx_file_metadata_mime_type").WillReturnResult(sqlmock.NewResult(0, 0))
	mock.ExpectExec("CREATE INDEX IF NOT EXISTS idx_file_metadata_file_size").WillReturnResult(sqlmock.NewResult(0, 0))
	mock.ExpectExec("CREATE INDEX IF NOT EXISTS idx_user_files_filename").WillReturnResult(sqlmock.NewResult(0, 0))
	mock.ExpectExec("CREATE INDEX IF NOT EXISTS idx_user_files_created_at").WillReturnResult(sqlmock.NewResult(0, 0))
	mock.ExpectExec("CREATE TABLE IF NOT EXISTS public_shares").WillReturnResult(sqlmock.NewResult(0, 0))
	mock.ExpectExec("CREATE INDEX IF NOT EXISTS idx_public_shares_token").WillReturnResult(sqlmock.NewResult(0, 0))
	return db, mock
}

func TestGetInitializedMockDB(t *testing.T) {
	db, mock := GetInitializedMockDB(t)
	defer db.Close()

	stmts := []string{
		"CREATE TABLE IF NOT EXISTS user_file_info",
		"CREATE TABLE IF NOT EXISTS users",
		"CREATE TABLE IF NOT EXISTS file_metadata",
		"CREATE TABLE IF NOT EXISTS user_files",
		"ALTER TABLE user_files ADD CONSTRAINT unique_file_share",
		"CREATE INDEX IF NOT EXISTS idx_file_metadata_filename",
		"CREATE INDEX IF NOT EXISTS idx_file_metadata_mime_type",
		"CREATE INDEX IF NOT EXISTS idx_file_metadata_file_size",
		"CREATE INDEX IF NOT EXISTS idx_user_files_filename",
		"CREATE INDEX IF NOT EXISTS idx_user_files_created_at",
		"CREATE TABLE IF NOT EXISTS public_shares",
		"CREATE INDEX IF NOT EXISTS idx_public_shares_token",
	}

	for _, stmt := range stmts {
		_, err := db.Exec(stmt)
		if err != nil {
			t.Errorf("Exec failed for statement: %s, error: %v", stmt, err)
		}
	}

	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("there were unfulfilled expectations: %s", err)
	}
}
