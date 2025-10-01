package files

import (
	files "backend/src/controllers/files"
	"backend/src/utils"
	"bytes"
	"database/sql"
	"io"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"

	"github.com/DATA-DOG/go-sqlmock"
	jwt "github.com/golang-jwt/jwt/v5"
)

// --- Mocks for RenameFileHandler ---
type mockFileCrudRepoForRename struct {
	getPath    func(username, filename string) (string, error)
	renameFile func(username, filename, newName string) error
}

func (m *mockFileCrudRepoForRename) GetFilePathByUsernameAndFilename(username, filename string) (string, error) {
	return m.getPath(username, filename)
}
func (m *mockFileCrudRepoForRename) RenameFileByFilename(username, filename, newName string) error {
	return m.renameFile(username, filename, newName)
}

// --- Error helpers ---
type errMock string

func (e errMock) Error() string {
	return string(e)
}

// --- Mocks for DeleteFileByFilenameHandler ---
type mockFileCrudRepoForDeleteByFilename struct {
	deleteErr error
}

func (m mockFileCrudRepoForDeleteByFilename) DeleteFileByFilename(username, filename string) error {
	return m.deleteErr
}
func TestDeleteFileByFilenameHandler_TableDriven(t *testing.T) {
	origValidateJWT := files.ValidateJWT
	origGetDB := files.GetDBForDeleteByFilename
	origNewRepo := files.NewFileCrudRepoForDeleteByFilename

	defer func() {
		files.ValidateJWT = origValidateJWT
		files.GetDBForDeleteByFilename = origGetDB
		files.NewFileCrudRepoForDeleteByFilename = origNewRepo
	}()

	type testCase struct {
		name       string
		body       string
		token      string
		mockJWT    func()
		mockRepo   func()
		expectCode int
	}

	tests := []testCase{
		{
			name:       "BadRequest_InvalidJSON",
			body:       "invalid-json",
			expectCode: http.StatusBadRequest,
		},
		{
			name:       "BadRequest_MissingFilename",
			body:       `{"filename":""}`,
			expectCode: http.StatusBadRequest,
		},
		{
			name:       "Unauthorized_MissingToken",
			body:       `{"filename":"abc.txt"}`,
			expectCode: http.StatusUnauthorized,
		},
		{
			name:  "Unauthorized_InvalidToken",
			body:  `{"filename":"abc.txt"}`,
			token: "badtoken",
			mockJWT: func() {
				files.ValidateJWT = func(token string) (jwt.MapClaims, error) {
					return nil, errMock("invalid token")
				}
			},
			expectCode: http.StatusUnauthorized,
		},
		{
			name:  "Unauthorized_NoUserInToken",
			body:  `{"filename":"abc.txt"}`,
			token: "goodtoken",
			mockJWT: func() {
				files.ValidateJWT = func(token string) (jwt.MapClaims, error) {
					return jwt.MapClaims{}, nil
				}
			},
			expectCode: http.StatusUnauthorized,
		},
		{
			name:  "NotFound_DeleteFileByFilename",
			body:  `{"filename":"abc.txt"}`,
			token: "goodtoken",
			mockJWT: func() {
				files.ValidateJWT = func(token string) (jwt.MapClaims, error) {
					return jwt.MapClaims{"user_id": "user1"}, nil
				}
			},
			mockRepo: func() {
				files.GetDBForDeleteByFilename = func() *sql.DB { return nil }
				files.NewFileCrudRepoForDeleteByFilename = func(db *sql.DB) files.FileCrudRepoForDeleteByFilename {
					return mockFileCrudRepoForDeleteByFilename{deleteErr: sql.ErrNoRows}
				}
			},
			expectCode: http.StatusNotFound,
		},
		{
			name:  "InternalError_DeleteFileByFilename",
			body:  `{"filename":"abc.txt"}`,
			token: "goodtoken",
			mockJWT: func() {
				files.ValidateJWT = func(token string) (jwt.MapClaims, error) {
					return jwt.MapClaims{"user_id": "user1"}, nil
				}
			},
			mockRepo: func() {
				files.GetDBForDeleteByFilename = func() *sql.DB { return nil }
				files.NewFileCrudRepoForDeleteByFilename = func(db *sql.DB) files.FileCrudRepoForDeleteByFilename {
					return mockFileCrudRepoForDeleteByFilename{deleteErr: errMock("fail delete")}
				}
			},
			expectCode: http.StatusInternalServerError,
		},
		{
			name:  "Success",
			body:  `{"filename":"abc.txt"}`,
			token: "goodtoken",
			mockJWT: func() {
				files.ValidateJWT = func(token string) (jwt.MapClaims, error) {
					return jwt.MapClaims{"user_id": "user1"}, nil
				}
			},
			mockRepo: func() {
				files.GetDBForDeleteByFilename = func() *sql.DB { return nil }
				files.NewFileCrudRepoForDeleteByFilename = func(db *sql.DB) files.FileCrudRepoForDeleteByFilename {
					return mockFileCrudRepoForDeleteByFilename{deleteErr: nil}
				}
			},
			expectCode: http.StatusOK,
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			if tc.mockJWT != nil {
				tc.mockJWT()
			}
			if tc.mockRepo != nil {
				tc.mockRepo()
			}
			req := httptest.NewRequest(http.MethodPost, "/api/v1/file/delete-filename", bytes.NewBufferString(tc.body))
			if tc.token != "" {
				req.Header.Set("Authorization", "Bearer "+tc.token)
			}
			rw := httptest.NewRecorder()
			files.DeleteFileByFilenameHandler(rw, req)
			if rw.Code != tc.expectCode {
				t.Errorf("expected %d, got %d", tc.expectCode, rw.Code)
			}
		})
	}
}

func TestRenameFileHandler_TableDriven(t *testing.T) {
	// Save and restore injectable dependencies
	origValidateJWT := files.ValidateJWT
	origGetDB := files.GetDBForRename
	origNewRepo := files.NewFileCrudRepoForRename
	origOpen := files.OpenFileForRename
	origValidateMime := files.ValidateMimeTypeForRename

	defer func() {
		files.ValidateJWT = origValidateJWT
		files.GetDBForRename = origGetDB
		files.NewFileCrudRepoForRename = origNewRepo
		files.OpenFileForRename = origOpen
		files.ValidateMimeTypeForRename = origValidateMime
	}()

	type testCase struct {
		name       string
		body       string
		token      string
		mockJWT    func()
		mockRepo   func()
		mockOpen   func()
		mockMime   func()
		expectCode int
	}

	tests := []testCase{
		{
			name:       "BadRequest_InvalidJSON",
			body:       "invalid-json",
			token:      "goodtoken",
			mockJWT: func() {
				files.ValidateJWT = func(token string) (jwt.MapClaims, error) {
					return jwt.MapClaims{"user_id": "user1"}, nil
				}
			},
			expectCode: http.StatusBadRequest,
		},
		{
			name:       "BadRequest_MissingFields",
			body:       `{"filename":"","newName":"","username":""}`,
			token:      "goodtoken",
			mockJWT: func() {
				files.ValidateJWT = func(token string) (jwt.MapClaims, error) {
					return jwt.MapClaims{"user_id": "user1"}, nil
				}
			},
			expectCode: http.StatusBadRequest,
		},
		{
			name:       "Unauthorized_MissingToken",
			body:       `{"filename":"a.txt","newName":"b.txt","username":"user1"}`,
			expectCode: http.StatusUnauthorized,
		},
		{
			name:  "Unauthorized_InvalidToken",
			body:  `{"filename":"a.txt","newName":"b.txt","username":"user1"}`,
			token: "badtoken",
			mockJWT: func() {
				files.ValidateJWT = func(token string) (jwt.MapClaims, error) {
					return nil, errMock("invalid token")
				}
			},
			expectCode: http.StatusUnauthorized,
		},
		{
			name:  "Unauthorized_NoUserInToken",
			body:  `{"filename":"a.txt","newName":"b.txt","username":"user1"}`,
			token: "goodtoken",
			mockJWT: func() {
				files.ValidateJWT = func(token string) (jwt.MapClaims, error) {
					return jwt.MapClaims{}, nil
				}
			},
			expectCode: http.StatusUnauthorized,
		},
		{
			name:  "BadRequest_InvalidNewName",
			body:  `{"filename":"a.txt","newName":"noext","username":"user1"}`,
			token: "goodtoken",
			mockJWT: func() {
				files.ValidateJWT = func(token string) (jwt.MapClaims, error) {
					return jwt.MapClaims{"user_id": "user1"}, nil
				}
			},
			expectCode: http.StatusBadRequest,
		},
		{
			name:  "NotFound_FilePath",
			body:  `{"filename":"a.txt","newName":"b.txt","username":"user1"}`,
			token: "goodtoken",
			mockJWT: func() {
				files.ValidateJWT = func(token string) (jwt.MapClaims, error) {
					return jwt.MapClaims{"user_id": "user1"}, nil
				}
			},
			mockRepo: func() {
				files.GetDBForRename = func() *sql.DB { return nil }
				files.NewFileCrudRepoForRename = func(db utils.DBExecutor) files.FileRenameRepo {
					return &mockFileCrudRepoForRename{
						getPath:    func(username, filename string) (string, error) { return "", sql.ErrNoRows },
						renameFile: func(username, filename, newName string) error { return nil },
					}
				}
			},
			expectCode: http.StatusNotFound,
		},
		{
			name:  "InternalError_FileOpen",
			body:  `{"filename":"a.txt","newName":"b.txt","username":"user1"}`,
			token: "goodtoken",
			mockJWT: func() {
				files.ValidateJWT = func(token string) (jwt.MapClaims, error) {
					return jwt.MapClaims{"user_id": "user1"}, nil
				}
			},
			mockRepo: func() {
				files.GetDBForRename = func() *sql.DB { return nil }
				files.NewFileCrudRepoForRename = func(db utils.DBExecutor) files.FileRenameRepo {
					return &mockFileCrudRepoForRename{
						getPath:    func(username, filename string) (string, error) { return "/tmp/file", nil },
						renameFile: func(username, filename, newName string) error { return nil },
					}
				}
			},
			mockOpen: func() {
				files.OpenFileForRename = func(name string) (io.ReadCloser, error) { return nil, errMock("fail open") }
			},
			expectCode: http.StatusInternalServerError,
		},
		{
			name:  "BadRequest_MimeType",
			body:  `{"filename":"a.txt","newName":"b.txt","username":"user1"}`,
			token: "goodtoken",
			mockJWT: func() {
				files.ValidateJWT = func(token string) (jwt.MapClaims, error) {
					return jwt.MapClaims{"user_id": "user1"}, nil
				}
			},
			mockRepo: func() {
				files.GetDBForRename = func() *sql.DB { return nil }
				files.NewFileCrudRepoForRename = func(db utils.DBExecutor) files.FileRenameRepo {
					return &mockFileCrudRepoForRename{
						getPath:    func(username, filename string) (string, error) { return "/tmp/file", nil },
						renameFile: func(username, filename, newName string) error { return nil },
					}
				}
			},
			mockOpen: func() {
				files.OpenFileForRename = func(name string) (io.ReadCloser, error) {
					// Return a fake in-memory file
					return io.NopCloser(bytes.NewReader([]byte("testdata"))), nil
				}
			},
			mockMime: func() {
				files.ValidateMimeTypeForRename = func(filename string, buf []byte) error { return errMock("mime mismatch") }
			},
			expectCode: http.StatusBadRequest,
		},
		{
			name:  "InternalError_Rename",
			body:  `{"filename":"a.txt","newName":"b.txt","username":"user1"}`,
			token: "goodtoken",
			mockJWT: func() {
				files.ValidateJWT = func(token string) (jwt.MapClaims, error) {
					return jwt.MapClaims{"user_id": "user1"}, nil
				}
			},
			mockRepo: func() {
				files.GetDBForRename = func() *sql.DB { return nil }
				files.NewFileCrudRepoForRename = func(db utils.DBExecutor) files.FileRenameRepo {
					return &mockFileCrudRepoForRename{
						getPath:    func(username, filename string) (string, error) { return "/tmp/file", nil },
						renameFile: func(username, filename, newName string) error { return errMock("fail rename") },
					}
				}
			},
			mockOpen: func() {
				files.OpenFileForRename = func(name string) (io.ReadCloser, error) {
					return io.NopCloser(bytes.NewReader([]byte("testdata"))), nil
				}
			},
			mockMime: func() {
				files.ValidateMimeTypeForRename = func(filename string, buf []byte) error { return nil }
			},
			expectCode: http.StatusInternalServerError,
		},
		{
			name:  "Success",
			body:  `{"filename":"a.txt","newName":"b.txt","username":"user1"}`,
			token: "goodtoken",
			mockJWT: func() {
				files.ValidateJWT = func(token string) (jwt.MapClaims, error) {
					return jwt.MapClaims{"user_id": "user1"}, nil
				}
			},
			mockRepo: func() {
				files.GetDBForRename = func() *sql.DB { return nil }
				files.NewFileCrudRepoForRename = func(db utils.DBExecutor) files.FileRenameRepo {
					return &mockFileCrudRepoForRename{
						getPath:    func(username, filename string) (string, error) { return "/tmp/file", nil },
						renameFile: func(username, filename, newName string) error { return nil },
					}
				}
			},
			mockOpen: func() {
				files.OpenFileForRename = func(name string) (io.ReadCloser, error) {
					return io.NopCloser(bytes.NewReader([]byte("testdata"))), nil
				}
			},
			mockMime: func() {
				files.ValidateMimeTypeForRename = func(filename string, buf []byte) error { return nil }
			},
			expectCode: http.StatusOK,
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			if tc.mockJWT != nil {
				tc.mockJWT()
			}
			if tc.mockRepo != nil {
				tc.mockRepo()
			}
			if tc.mockOpen != nil {
				tc.mockOpen()
			} else {
				// Default: use a safe in-memory file for all tests
				files.OpenFileForRename = func(name string) (io.ReadCloser, error) {
					return io.NopCloser(bytes.NewReader([]byte("testdata"))), nil
				}
			}
			if tc.mockMime != nil {
				tc.mockMime()
			}
			req := httptest.NewRequest(http.MethodPost, "/api/v1/file/rename", bytes.NewBufferString(tc.body))
			if tc.token != "" {
				req.Header.Set("Authorization", "Bearer "+tc.token)
			}
			rw := httptest.NewRecorder()
			files.RenameFileHandler(rw, req)
			if rw.Code != tc.expectCode {
				t.Errorf("expected %d, got %d", tc.expectCode, rw.Code)
			}
		})
	}
}

func TestMain(m *testing.M) {
	// Use sqlmock to provide a working *sql.DB for all tests
	db, _, err := sqlmock.New()
	if err != nil {
		panic("failed to create sqlmock: " + err.Error())
	}
	utils.GetDBFunc = func() *sql.DB { return db }
	os.Exit(m.Run())
}
