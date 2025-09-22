package dto

// AdminGenerateTokenRequest is the payload for admin generating a user token
type AdminGenerateTokenRequest struct {
	Username string `json:"username"`
}

// AdminFileUploadRequest for admin file uploads
type AdminFileUploadRequest struct {
	Filename string `json:"filename"`
	Uploader string `json:"uploader"` // Admin's username
	Hash     string `json:"hash"`
	Path     string `json:"path"`
	MIMEType string `json:"mimeType"`
}

// AdminShareRequest for admin sharing files
type AdminShareRequest struct {
	FileId     string `json:"fileId"`
	ShareWith  string `json:"shareWith"`  // Username to share with
	Permission string `json:"permission"` // e.g., "viewer", "editor"
}

// AdminFileListResponse for listing all files
type AdminFileListResponse struct {
	Files []AdminFile `json:"files"`
}

type AdminFile struct {
	Id            int     `json:"id"`
	Filename      string  `json:"filename"`
	Uploader      string  `json:"uploader"`
	FileSize      float64 `json:"fileSize"`
	MimeType      string  `json:"mimeType"`
	DownloadCount int     `json:"downloadCount"`
	CreatedAt     string  `json:"createdAt"`
}

// AdminStatsResponse for usage statistics
type AdminStatsResponse struct {
	TotalLogicalFiles   int     `json:"totalFiles"`
	TotalPhysicalFiles  int     `json:"totalPhysicalFiles"`
	TotalUsers          int     `json:"totalUsers"`
	TotalDownloads      int     `json:"totalDownloads"`
	TotalStorageUsed    float64 `json:"totalStorageUsed"`
	TotalLogicalStorage float64 `json:"totalLogicalStorage"`
	SpaceSaved          float64 `json:"spaceSaved"`
	AvgFilesPerUser     float64 `json:"avgFilesPerUser"`
	AvgStoragePerUser   float64 `json:"avgStoragePerUser"`
	DeduplicationRatio  float64 `json:"deduplicationRatio"`
}

// AdminGenerateTokenResponse represents the response for admin token generation
type AdminGenerateTokenResponse struct {
	Username string `json:"username"`
	Token    string `json:"token"`
}
