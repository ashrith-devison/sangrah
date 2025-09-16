package dto

type FileShareRequest struct {
	Owner      string `json:"owner"`
	Recipient  string `json:"recipient"`
	FileID     string `json:"fileId"`
	Permission string `json:"permission"` // e.g., "read", "write"
}

type FileShareResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
}

type UserFile struct {
	ID         int    `json:"id"`
	Username   string `json:"username"`
	FileID     string `json:"fileId"`
	Permission string `json:"permission"`
}
