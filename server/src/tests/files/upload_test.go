package files

import (
	"bytes"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"

	"backend/src/config"
	"backend/src/controllers/files"
	"backend/src/dto"
	"encoding/json"
	"io"

	gozap "go.uber.org/zap"
)

func TestFileMetaUploadHandler_MockStorage(t *testing.T) {
	// Inject mock uploader, repo, service, logger, and user file crud service
	origUploader := files.FileUploaderImpl
	origRepo := files.FileCrudRepoImpl
	origService := files.FileService
	origLogger := files.FileLogger
	origUserFileCrud := files.UserFileCrudServiceImpl
	files.FileUploaderImpl = mockUploader{}
	files.FileCrudRepoImpl = mockFileCrudRepo{}
	files.FileService = mockFileService{}
	files.FileLogger = gozap.NewNop()
	files.UserFileCrudServiceImpl = func(cfg *config.Config) files.UserFileCrudService { return mockUserFileCrudService{} }
	defer func() {
		files.FileUploaderImpl = origUploader
		files.FileCrudRepoImpl = origRepo
		files.FileService = origService
		files.FileLogger = origLogger
		files.UserFileCrudServiceImpl = origUserFileCrud
	}()

	// Prepare multipart form data
	var buf bytes.Buffer
	w := multipart.NewWriter(&buf)
	fw, err := w.CreateFormFile("file", "test.txt")
	if err != nil {
		t.Fatalf("CreateFormFile: %v", err)
	}
	fw.Write([]byte("hello test file"))
	w.WriteField("uploader", "testuser")
	w.Close()

	req := httptest.NewRequest(http.MethodPost, "/api/v1/file/upload-meta", &buf)
	req.Header.Set("Content-Type", w.FormDataContentType())
	rw := httptest.NewRecorder()

	files.FileMetaUploadHandler(rw, req)

	if rw.Code != http.StatusCreated {
		t.Fatalf("expected 201, got %d", rw.Code)
	}
	// Check file exists in storage/test/
	if _, err := os.Stat("storage/test/test.txt"); err != nil {
		t.Errorf("file not created in storage/test/: %v", err)
	}
	// Clean up
	os.Remove("storage/test/test.txt")
}

func TestFileMetaUploadHandler_TableDriven(t *testing.T) {
	testCases := []struct {
		name      string
		setupForm func(w *multipart.Writer)
		wantCode  int
		wantCheck func(*testing.T, *httptest.ResponseRecorder)
	}{
		{
			name: "valid text file",
			setupForm: func(w *multipart.Writer) {
				fw, _ := w.CreateFormFile("file", "test.txt")
				fw.Write([]byte("hello test file"))
				w.WriteField("uploader", "testuser")
			},
			wantCode: http.StatusCreated,
			wantCheck: func(t *testing.T, rw *httptest.ResponseRecorder) {
				if _, err := os.Stat("storage/test/test.txt"); err != nil {
					t.Errorf("file not created: %v", err)
				}
				os.Remove("storage/test/test.txt")
			},
		},
		{
			name: "missing uploader",
			setupForm: func(w *multipart.Writer) {
				fw, _ := w.CreateFormFile("file", "test.txt")
				fw.Write([]byte("hello test file"))
			},
			wantCode:  http.StatusBadRequest,
			wantCheck: nil,
		},
		{
			name: "no file in form",
			setupForm: func(w *multipart.Writer) {
				w.WriteField("uploader", "testuser")
			},
			wantCode:  http.StatusBadRequest,
			wantCheck: nil,
		},
		{
			name:      "malformed multipart",
			setupForm: func(w *multipart.Writer) {},
			wantCode:  http.StatusBadRequest,
			wantCheck: nil,
		},
		{
			name: "multiple files",
			setupForm: func(w *multipart.Writer) {
				fw, _ := w.CreateFormFile("file", "a.txt")
				fw.Write([]byte("a"))
				fw2, _ := w.CreateFormFile("file", "b.txt")
				fw2.Write([]byte("b"))
				w.WriteField("uploader", "testuser")
			},
			wantCode: http.StatusCreated,
			wantCheck: func(t *testing.T, rw *httptest.ResponseRecorder) {
				os.Remove("storage/test/a.txt")
				os.Remove("storage/test/b.txt")
			},
		},
		// Add more cases as needed for quota, duplicate, mime, etc.
	}

	// Inject mocks as in the single test
	origUploader := files.FileUploaderImpl
	origRepo := files.FileCrudRepoImpl
	origService := files.FileService
	origLogger := files.FileLogger
	origUserFileCrud := files.UserFileCrudServiceImpl
	files.FileUploaderImpl = mockUploader{}
	files.FileCrudRepoImpl = mockFileCrudRepo{}
	files.FileService = mockFileService{}
	files.FileLogger = gozap.NewNop()
	files.UserFileCrudServiceImpl = func(cfg *config.Config) files.UserFileCrudService { return mockUserFileCrudService{} }
	defer func() {
		files.FileUploaderImpl = origUploader
		files.FileCrudRepoImpl = origRepo
		files.FileService = origService
		files.FileLogger = origLogger
		files.UserFileCrudServiceImpl = origUserFileCrud
	}()

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			var buf bytes.Buffer
			w := multipart.NewWriter(&buf)
			tc.setupForm(w)
			w.Close()
			req := httptest.NewRequest(http.MethodPost, "/api/v1/file/upload-meta", &buf)
			req.Header.Set("Content-Type", w.FormDataContentType())
			rw := httptest.NewRecorder()
			files.FileMetaUploadHandler(rw, req)
			if rw.Code != tc.wantCode {
				t.Errorf("expected %d, got %d", tc.wantCode, rw.Code)
			}
			if tc.wantCheck != nil {
				tc.wantCheck(t, rw)
			}
		})
	}
}

func TestFileMetaViewHandler(t *testing.T) {
	// Setup: create a mock file in storage/
	os.MkdirAll("storage", 0755)
	filePath := "storage/viewme.txt"
	os.WriteFile(filePath, []byte("view content"), 0644)
	defer os.Remove(filePath)

	// Mock FileService to return the file meta for the test file
	origService := files.FileService
	files.FileService = mockFileServiceView{
		fileMeta: dto.FileMeta{
			Filename: "viewme.txt",
			MIMEType: "text/plain",
			Path:     filePath,
		},
	}
	defer func() { files.FileService = origService }()

	rw := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodGet, "/api/v1/file/path/view?path=viewme.txt", nil)

	files.ServeFileByPathViewHandler(rw, req)

	if rw.Code != http.StatusOK {
		t.Errorf("expected 200, got %d", rw.Code)
	}
	if rw.Body.String() != "view content" {
		t.Errorf("unexpected file content: %s", rw.Body.String())
	}
	contentType := rw.Header().Get("Content-Type")
	if contentType == "" {
		t.Errorf("missing Content-Type header")
	}
	disposition := rw.Header().Get("Content-Disposition")
	if disposition == "" || disposition != "inline; filename=viewme.txt" {
		t.Errorf("missing or incorrect Content-Disposition header: %s", disposition)
	}
}

// mockFileServiceView implements FileService for view handler test
type mockFileServiceView struct{ fileMeta dto.FileMeta }

func (m mockFileServiceView) StoreFileMetadata(filename, mimetype, hash, path, uploader string) error {
	return nil
}
func (m mockFileServiceView) CheckDuplicate(hash string) (bool, string) {
	return false, ""
}
func (m mockFileServiceView) GetFileByPath(path string) (dto.FileMeta, error) {
	return m.fileMeta, nil
}
func (m mockFileServiceView) CoreUpload(file io.ReadSeeker, filename string, r *http.Request) (string, string, string, string, error) {
	return "", "", "", "", nil
}

// mockSearchService for SearchFilesHandler tests
type mockSearchService struct {
	results []dto.FileMeta
	err     error
}

func (m mockSearchService) SearchFiles(params dto.FileSearchParams) ([]dto.FileMeta, error) {
	return m.results, m.err
}

func TestSearchFilesHandler_TableDriven(t *testing.T) {
	// Mock the FileSearchService
	origSearchService := files.FileSearchService

	testCases := []struct {
		name     string
		query    string
		mockRes  []dto.FileMeta
		mockErr  error
		wantCode int
		wantLen  int
	}{
		{
			name:     "basic search by filename",
			query:    "?filename=test.txt",
			mockRes:  []dto.FileMeta{{Filename: "test.txt"}},
			wantCode: http.StatusOK,
			wantLen:  1,
		},
		{
			name:     "search by MIME type",
			query:    "?mimeType=application/pdf",
			mockRes:  []dto.FileMeta{{Filename: "a.pdf", MIMEType: "application/pdf"}},
			wantCode: http.StatusOK,
			wantLen:  1,
		},
		{
			name:     "search by uploader",
			query:    "?uploader=testuser",
			mockRes:  []dto.FileMeta{{Filename: "a.txt", Uploader: "testuser"}},
			wantCode: http.StatusOK,
			wantLen:  1,
		},
		{
			name:     "search with minSize and maxSize",
			query:    "?minSize=100&maxSize=2000",
			mockRes:  []dto.FileMeta{{Filename: "big.txt"}},
			wantCode: http.StatusOK,
			wantLen:  1,
		},
		{
			name:     "search with startDate and endDate",
			query:    "?startDate=2025-01-01&endDate=2025-12-31",
			mockRes:  []dto.FileMeta{{Filename: "dated.txt"}},
			wantCode: http.StatusOK,
			wantLen:  1,
		},
		{
			name:     "search with limit and offset",
			query:    "?limit=2&offset=1",
			mockRes:  []dto.FileMeta{{Filename: "a.txt"}, {Filename: "b.txt"}},
			wantCode: http.StatusOK,
			wantLen:  2,
		},
		{
			name:     "search with no parameters",
			query:    "",
			mockRes:  []dto.FileMeta{{Filename: "default.txt"}},
			wantCode: http.StatusOK,
			wantLen:  1,
		},
		{
			name:     "search with invalid minSize/maxSize",
			query:    "?minSize=abc&maxSize=xyz",
			mockRes:  []dto.FileMeta{{Filename: "file.txt"}},
			wantCode: http.StatusOK,
			wantLen:  1,
		},
		{
			name:     "search with no results",
			query:    "?filename=doesnotexist.txt",
			mockRes:  []dto.FileMeta{},
			wantCode: http.StatusOK,
			wantLen:  0,
		},
		{
			name:     "internal error from service",
			query:    "?filename=error.txt",
			mockRes:  nil,
			mockErr:  io.ErrUnexpectedEOF,
			wantCode: http.StatusInternalServerError,
			wantLen:  0,
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			files.FileSearchService = mockSearchService{results: tc.mockRes, err: tc.mockErr}
			defer func() { files.FileSearchService = origSearchService }()
			rw := httptest.NewRecorder()
			req := httptest.NewRequest(http.MethodGet, "/api/v1/file/search"+tc.query, nil)
			files.SearchFilesHandler(rw, req)
			if rw.Code != tc.wantCode {
				t.Errorf("expected %d, got %d", tc.wantCode, rw.Code)
			}
			if tc.wantCode == http.StatusOK {
				// Check length of results in response JSON
				var resp struct {
					Data []dto.FileMeta `json:"data"`
				}
				json.NewDecoder(rw.Body).Decode(&resp)
				if len(resp.Data) != tc.wantLen {
					t.Errorf("expected %d results, got %d", tc.wantLen, len(resp.Data))
				}
			}
		})
	}
}
