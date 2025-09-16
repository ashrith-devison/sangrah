package dto

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
	FileID   string `json:"fileId"`
	NewName  string `json:"newName"`
	Username string `json:"username"`
}

type DeleteFileRequest struct {
	FileId   string `json:"fileId"`
	Username string `json:"username"`
}
