package services

import (
	"fmt"
	"strings"

	"blank/pkg/app/models"
	"blank/pkg/app/repositories"
	"blank/pkg/app/utils"

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

func (a *UserService) UpdateUserInfo(userID uuid.UUID, userInfo models.UserInfo) error {
	err := a.UserRepo.UpdateUserInfo(userID, userInfo)
	if err != nil {
		return err
	}
	if strings.HasPrefix(userInfo.Avatar, "data:image") {
		avatarFilename, err := utils.SaveImage(userInfo.Avatar)
		if err != nil {
			return fmt.Errorf("invalid image")
		}
		err = a.UserRepo.SaveAvatar(userID, avatarFilename)
		if err != nil {
			return err
		}
	}

	return nil
}
