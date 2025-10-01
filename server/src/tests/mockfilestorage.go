package tests

import (
	"os"
	"path/filepath"
	"runtime"
	"testing"
)

// CreateMockFileInDir creates a file with the given name and content in the specified directory.
// Returns the full file path and a cleanup function to remove the file after the test.
func getProjectRoot() string {
	_, b, _, _ := runtime.Caller(0)
	// b is the full path to this file (mockfilestorage.go)
	// project root is 3 dirs up from src/tests/mockfilestorage.go
	return filepath.Clean(filepath.Join(filepath.Dir(b), "..", "..", ".."))
}

func CreateMockFileInDir(t *testing.T, baseDir, filename string, content []byte) (string, func()) {
	root := getProjectRoot()
	absDir := filepath.Join(root, baseDir)
	err := os.MkdirAll(absDir, 0755)
	if err != nil {
		t.Fatalf("failed to create test storage dir: %v", err)
	}
	filePath := filepath.Join(absDir, filename)
	err = os.WriteFile(filePath, content, 0644)
	if err != nil {
		t.Fatalf("failed to create mock file: %v", err)
	}
	cleanup := func() {
		os.Remove(filePath)
	}
	return filePath, cleanup
}

// CreateMockFile creates a file in the storage/test/ directory for test isolation.
func CreateMockFile(t *testing.T, filename string, content []byte) (string, func()) {
	return CreateMockFileInDir(t, "storage/test/", filename, content)
}
