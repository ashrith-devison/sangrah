package utils

import (
	"context"
)

// UsernameKey is the context key for username
var UsernameKey = &struct{ name string }{"username"}

// RoleKey is the context key for role
var RoleKey = &struct{ name string }{"role"}

// SetUsernameInContext sets the username in context
func SetUsernameInContext(ctx context.Context, username string) context.Context {
	return context.WithValue(ctx, UsernameKey, username)
}

// GetUsernameFromContext gets the username from context
func GetUsernameFromContext(ctx context.Context) (string, bool) {
	username, ok := ctx.Value(UsernameKey).(string)
	return username, ok
}

// SetRoleInContext sets the role in context
func SetRoleInContext(ctx context.Context, role string) context.Context {
	return context.WithValue(ctx, RoleKey, role)
}

// GetRoleFromContext gets the role from context
func GetRoleFromContext(ctx context.Context) (string, bool) {
	role, ok := ctx.Value(RoleKey).(string)
	return role, ok
}
