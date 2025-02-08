package models

import (
	"github.com/gofrs/uuid/v5"
)

type Category struct {
	ID   uuid.UUID
	Name string
}
