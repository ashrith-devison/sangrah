package services

import "backend/src/dto"

type UserServiceInterface interface {
	GetUser(username string) (dto.User, error)
	UpdateUser(username string, req dto.UserUpdateRequest) error
	DeleteUser(username string) error
}

type FileCrudServiceInterface interface {
	RenameFile(req dto.FileRenameRequest) error
	DeleteFile(req dto.DeleteFileRequest) error
	InsertUserFile(username, fileId, filename, permission string) error
}
