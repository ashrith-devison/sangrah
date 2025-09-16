package dto

type FileMeta struct {
	// Uploader is provided by user (username)
	Uploader string `json:"uploader"`
	// The following fields are computed by handlers
	Filename       string  `json:"filename"`
	MIMEType       string  `json:"mimeType"`
	SHA256         string  `json:"sha256"`
	Path           string  `json:"path"`
	UploadDate     string  `json:"uploadDate"`
	ReferenceID    string  `json:"referenceID"`
	ReferenceCount int     `json:"referenceCount"`
	FileSize       float64 `json:"fileSize"`
}
