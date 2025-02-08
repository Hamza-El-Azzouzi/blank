package services

import (
	"blank/pkg/app/models"
	"blank/pkg/app/repositories"
)

type UserService struct {
	UserRepo *repositories.UserRepository
}

func (a *UserService) GetUserInfo(userID int) (*models.UserInfo, error) {
	user, err := a.UserRepo.GetUserInfo(userID)
	if err != nil {
		return nil, err
	}
	return user, nil
}
