package dto

// Request for sharing a file
type FileShareRequest struct {
	Owner      string `json:"owner"`
	Recipient  string `json:"recipient"`
	FileID     string `json:"fileId"`
	Permission string `json:"permission"` // e.g., "read", "write"
	Filename   string `json:"filename"`   // Name of the file to share
}

// Response for file sharing
type FileShareResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
}

// Represents a user's file with associated metadata
type UserFile struct {
	ID         int    `json:"id"`
	Username   string `json:"username"`
	FileID     string `json:"fileId"`
	Permission string `json:"permission"`
}

// Used for responses in shared-with-me and shared-by-you handlers
// swagger:model SharedFileInfo
// @Description File shared with/by a user
// @Property id int "ID"
// @Property username string "Username"
// @Property fileId string "File ID"
// @Property filename string "Filename"
// @Property path string "File path"
// @Property permission string "Permission"
// @Property sharedWith string "Shared with user"
// @Property sharedBy string "Shared by user"
// @Property isPublic bool "Is public"
// @Property downloadCount int "Download count"
// @Property createdAt string "Created at"
type SharedFileInfo struct {
	ID            int    `json:"id"`
	Username      string `json:"username"`
	FileID        string `json:"fileId"`
	Filename      string `json:"filename"`
	Path          string `json:"path"`
	Permission    string `json:"permission"`
	SharedWith    string `json:"sharedWith"`
	SharedBy      string `json:"sharedBy"`
	IsPublic      bool   `json:"isPublic"`
	DownloadCount int    `json:"downloadCount"`
	CreatedAt     string `json:"createdAt"`
}
