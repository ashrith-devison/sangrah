package files

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"
	"testing"

	"backend/src/config"
	files "backend/src/controllers/files"
	"backend/src/dto"
	"backend/src/repos"
	"backend/src/utils"
	"database/sql"

	"github.com/DATA-DOG/go-sqlmock"
)

// --- Error helpers ---
type errMock string

func (e errMock) Error() string { return string(e) }

// --- Mocks ---
type mockPublicShareService struct {
	ResolveTokenFunc  func(token string) (dto.FileMeta, error)
	SharePubliclyFunc func(req dto.PublicShareRequest) (dto.PublicShareResponse, error)
}

func (m *mockPublicShareService) ResolveToken(token string) (dto.FileMeta, error) {
	if m.ResolveTokenFunc != nil {
		return m.ResolveTokenFunc(token)
	}
	return dto.FileMeta{}, nil
}
func (m *mockPublicShareService) SharePublicly(req dto.PublicShareRequest) (dto.PublicShareResponse, error) {
	if m.SharePubliclyFunc != nil {
		return m.SharePubliclyFunc(req)
	}
	return dto.PublicShareResponse{}, nil
}

type mockStorageService struct {
	GetFileFunc func(path string) (io.ReadCloser, error)
}

func (m *mockStorageService) GetFile(path string) (io.ReadCloser, error) {
	if m.GetFileFunc != nil {
		return m.GetFileFunc(path)
	}
	return nil, nil
}

// --- Mock DBExecutor using sqlmock for handler success path ---
type mockDBExecutor struct {
	sqlmock.Sqlmock
	db *sql.DB
}

func newMockDBExecutor() (*mockDBExecutor, error) {
	db, mock, err := sqlmock.New()
	if err != nil {
		return nil, err
	}
	// Expect the query and return a row with file_id = "mock-file-id"
	mock.ExpectQuery("SELECT file_id FROM user_files WHERE username = .+ AND filename = .+ AND permission = 'owner'").
		WillReturnRows(sqlmock.NewRows([]string{"file_id"}).AddRow("mock-file-id"))
	return &mockDBExecutor{Sqlmock: mock, db: db}, nil
}
func (m *mockDBExecutor) QueryRow(query string, args ...interface{}) *sql.Row {
	return m.db.QueryRow(query, args...)
}
func (m *mockDBExecutor) Exec(query string, args ...interface{}) (sql.Result, error) {
	return m.db.Exec(query, args...)
}
func (m *mockDBExecutor) Query(query string, args ...interface{}) (*sql.Rows, error) {
	return m.db.Query(query, args...)
}

// --- Table-driven tests ---

func Test_PublicFileShare_Handlers(t *testing.T) {
	// Save and restore injectable dependencies
	origGetDB := files.GetDBForPublicFileShare
	origLoadConfig := files.LoadConfig
	origNewPublicShareService := files.NewPublicShareService
	origNewStorageService := files.NewStorageService

	defer func() {
		files.GetDBForPublicFileShare = origGetDB
		files.LoadConfig = origLoadConfig
		files.NewPublicShareService = origNewPublicShareService
		files.NewStorageService = origNewStorageService
	}()

	type testCase struct {
		name  string
		setup func()
		run   func(*testing.T)
	}

	tests := []testCase{
		{
			name:  "PublicAccessHandler_MissingToken",
			setup: func() {},
			run: func(t *testing.T) {
				r := httptest.NewRequest(http.MethodGet, "/api/v1/file/path/view", nil)
				rw := httptest.NewRecorder()
				files.PublicAccessHandler(rw, r)
				if rw.Code != http.StatusBadRequest {
					t.Errorf("expected 400, got %d", rw.Code)
				}

			},
		},
		{
			name: "PublicAccessHandler_ResolveToken_InternalError",
			setup: func() {
				files.LoadConfig = func() (*config.Config, error) { return &config.Config{}, nil }
				files.NewPublicShareService = func(cfg *config.Config) files.PublicShareServiceInterface {
					return &mockPublicShareService{
						ResolveTokenFunc: func(token string) (dto.FileMeta, error) {
							return dto.FileMeta{}, errMock("fail resolve")
						},
					}
				}
			},
			run: func(t *testing.T) {
				r := httptest.NewRequest(http.MethodGet, "/api/v1/file/path/view?token=abc", nil)
				rw := httptest.NewRecorder()
				files.PublicAccessHandler(rw, r)
				if rw.Code != http.StatusInternalServerError {
					t.Errorf("expected 500, got %d", rw.Code)
				}
			},
		},
		{
			name: "PublicAccessHandler_FileOpenError",
			setup: func() {
				files.LoadConfig = func() (*config.Config, error) { return &config.Config{}, nil }
				files.NewPublicShareService = func(cfg *config.Config) files.PublicShareServiceInterface {
					return &mockPublicShareService{
						ResolveTokenFunc: func(token string) (dto.FileMeta, error) {
							return dto.FileMeta{Path: "file.txt", MIMEType: "text/plain"}, nil
						},
					}
				}
				files.NewStorageService = func(baseDir string) files.StorageServiceInterface {
					return &mockStorageService{
						GetFileFunc: func(path string) (io.ReadCloser, error) { return nil, errMock("fail open") },
					}
				}
			},
			run: func(t *testing.T) {
				r := httptest.NewRequest(http.MethodGet, "/api/v1/file/path/view?token=abc", nil)
				rw := httptest.NewRecorder()
				files.PublicAccessHandler(rw, r)
				if rw.Code != http.StatusInternalServerError {
					t.Errorf("expected 500, got %d", rw.Code)
				}
			},
		},
		{
			name: "PublicAccessHandler_Success",
			setup: func() {
				files.LoadConfig = func() (*config.Config, error) { return &config.Config{}, nil }
				files.NewPublicShareService = func(cfg *config.Config) files.PublicShareServiceInterface {
					return &mockPublicShareService{
						ResolveTokenFunc: func(token string) (dto.FileMeta, error) {
							return dto.FileMeta{Path: "file.txt", MIMEType: "text/plain"}, nil
						},
					}
				}
				files.NewStorageService = func(baseDir string) files.StorageServiceInterface {
					return &mockStorageService{
						GetFileFunc: func(path string) (io.ReadCloser, error) {
							return io.NopCloser(bytes.NewReader([]byte("testdata"))), nil
						},
					}
				}
			},
			run: func(t *testing.T) {
				r := httptest.NewRequest(http.MethodGet, "/api/v1/file/path/view?token=abc", nil)
				rw := httptest.NewRecorder()
				files.PublicAccessHandler(rw, r)
				if rw.Code != http.StatusOK {
					t.Errorf("expected 200, got %d", rw.Code)
				}
			},
		},
		{
			name:  "PublicShareHandler_BadRequest",
			setup: func() {},
			run: func(t *testing.T) {
				r := httptest.NewRequest(http.MethodPost, "/api/v1/file/public-share", bytes.NewBufferString("invalid-json"))
				rw := httptest.NewRecorder()
				files.PublicShareHandler(rw, r)
				if rw.Code != http.StatusBadRequest {
					t.Errorf("expected 400, got %d", rw.Code)
				}
			},
		},
		{
			name:  "PublicShareHandler_MissingFields",
			setup: func() {},
			run: func(t *testing.T) {
				body := map[string]string{"filename": "", "username": ""}
				b, _ := json.Marshal(body)
				r := httptest.NewRequest(http.MethodPost, "/api/v1/file/public-share", bytes.NewBuffer(b))
				rw := httptest.NewRecorder()
				files.PublicShareHandler(rw, r)
				if rw.Code != http.StatusBadRequest {
					t.Errorf("expected 400, got %d", rw.Code)
				}
			},
		},
		{
			name: "PublicShareHandler_ConfigError",
			setup: func() {
				files.GetDBForPublicFileShare = func() *sql.DB {
					mockDb, _ := newMockDBExecutor()
					return mockDb.db
				}
				files.LoadConfig = func() (*config.Config, error) { return nil, errMock("fail config") }
			},
			run: func(t *testing.T) {
				body := map[string]string{"filename": "file.txt", "username": "user1"}
				b, _ := json.Marshal(body)
				r := httptest.NewRequest(http.MethodPost, "/api/v1/file/public-share", bytes.NewBuffer(b))
				rw := httptest.NewRecorder()
				files.PublicShareHandler(rw, r)
				if rw.Code != http.StatusInternalServerError {
					t.Errorf("expected 500, got %d", rw.Code)
				}
			},
		},
		{
			name: "PublicShareHandler_Success",
			setup: func() {
				files.GetDBForPublicFileShare = func() *sql.DB {
					mockDb, _ := newMockDBExecutor()
					return mockDb.db
				}
				files.NewFileCrudRepo = func(db utils.DBExecutor) *repos.FileCrudRepo {
					mockDb, _ := newMockDBExecutor()
					return &repos.FileCrudRepo{Db: mockDb}
				}
				files.LoadConfig = func() (*config.Config, error) { return &config.Config{}, nil }
				files.NewPublicShareService = func(cfg *config.Config) files.PublicShareServiceInterface {
					return &mockPublicShareService{
						SharePubliclyFunc: func(req dto.PublicShareRequest) (dto.PublicShareResponse, error) {
							return dto.PublicShareResponse{PublicUrl: "http://test", Token: "tok"}, nil
						},
					}
				}
			},
			run: func(t *testing.T) {
				body := map[string]string{"filename": "file.txt", "username": "user1"}
				b, _ := json.Marshal(body)
				r := httptest.NewRequest(http.MethodPost, "/api/v1/file/public-share", bytes.NewBuffer(b))
				rw := httptest.NewRecorder()
				files.PublicShareHandler(rw, r)
				if rw.Code != http.StatusOK {
					t.Errorf("expected 200, got %d", rw.Code)
				}
			},
		},
		{
			name: "PublicShareHandler_Success_AltUser",
			setup: func() {
				files.GetDBForPublicFileShare = func() *sql.DB {
					mockDb, _ := newMockDBExecutor()
					return mockDb.db
				}
				files.NewFileCrudRepo = func(db utils.DBExecutor) *repos.FileCrudRepo {
					mockDb, _ := newMockDBExecutor()
					return &repos.FileCrudRepo{Db: mockDb}
				}
				files.LoadConfig = func() (*config.Config, error) { return &config.Config{}, nil }
				files.NewPublicShareService = func(cfg *config.Config) files.PublicShareServiceInterface {
					return &mockPublicShareService{
						SharePubliclyFunc: func(req dto.PublicShareRequest) (dto.PublicShareResponse, error) {
							return dto.PublicShareResponse{PublicUrl: "http://alt-url", Token: "alt-tok"}, nil
						},
					}
				}
			},
			run: func(t *testing.T) {
				body := map[string]string{"filename": "altfile.txt", "username": "altuser"}
				b, _ := json.Marshal(body)
				r := httptest.NewRequest(http.MethodPost, "/api/v1/file/public-share", bytes.NewBuffer(b))
				rw := httptest.NewRecorder()
				files.PublicShareHandler(rw, r)
				if rw.Code != http.StatusOK {
					t.Errorf("expected 200, got %d", rw.Code)
				}
			},
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			// Reset all injectable dependencies to default before each test
			files.GetDBForPublicFileShare = origGetDB
			files.LoadConfig = origLoadConfig
			files.NewPublicShareService = origNewPublicShareService
			files.NewStorageService = origNewStorageService
			if tc.setup != nil {
				tc.setup()
			}
			tc.run(t)
		})
	}
}
