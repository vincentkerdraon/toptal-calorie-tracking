package token

import (
	"topal.com/calorysampleproject/lib/user"
)

type TokenEncoded string
type UserRole string

const (
	RoleAdmin UserRole = "admin"
	RoleUser  UserRole = "user"
)

// Assuming the token is a JWT token containing this data
type Token struct {
	ID   user.ID
	Name string
	Role UserRole
}

type Decoder interface {
	Decode(TokenEncoded) (*Token, error)
}

type UnauthorizedError struct{}

func (e *UnauthorizedError) Error() string {
	return "Unauthorized"
}
