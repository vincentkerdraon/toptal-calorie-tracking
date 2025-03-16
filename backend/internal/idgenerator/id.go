package idgenerator

import (
	"github.com/google/uuid"
)

type (
	IDGenerator interface {
		ID() string
	}

	GoogleUUID struct{}
)

func (*GoogleUUID) ID() string {
	return uuid.New().String()
}
