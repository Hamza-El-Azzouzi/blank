package services

import (
	"blank/pkg/app/models"
	"blank/pkg/app/repositories"

	"github.com/gofrs/uuid/v5"
)

type UserService struct {
	UserRepo *repositories.UserRepository
}

func (a *UserService) GetUserInfo(userID uuid.UUID) (*models.UserInfo, error) {
	user, err := a.UserRepo.GetUserInfo(userID)
	if err != nil {
		return nil, err
	}
	return user, nil
}
