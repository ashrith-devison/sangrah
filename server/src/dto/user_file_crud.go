package dto

// Public share by filename DTO
type PublicShareByFilenameRequest struct {
	Filename string `json:"filename"`
	Username string `json:"username"`
}

type User struct {
	Username string `json:"username"`
	Email    string `json:"email"`
	Password string `json:"password,omitempty"`
}

type UserUpdateRequest struct {
	Email    string `json:"email,omitempty"`
	Password string `json:"password,omitempty"`
}

type FileRenameRequest struct {
	Filename string `json:"filename"`
	NewName  string `json:"newName"`
	Username string `json:"username"`
}

type DeleteFileRequest struct {
	FileId   string `json:"fileId"`
	Username string `json:"username"`
}

type DeleteFileByFilenameRequest struct {
	Username string `json:"username"`
	Filename string `json:"filename"`
}

// Public Share DTOs
type PublicShareRequest struct {
	FileId   string `json:"fileId"`
	Username string `json:"username"`
}

type PublicShareResponse struct {
	PublicUrl string `json:"publicUrl"`
	Token     string `json:"token"`
}
