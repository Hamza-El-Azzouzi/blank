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

func (u *UserService) GetUserInfo(userID uuid.UUID) (*models.UserInfo, error) {
	user, err := u.UserRepo.GetUserInfo(userID)
	if err != nil {
		return nil, err
	}
	return user, nil
}

func (u *UserService) UpdateUserInfo(userID uuid.UUID, userInfo models.UserInfo) error {
	err := u.UserRepo.UpdateUserInfo(userID, userInfo)
	if err != nil {
		return err
	}
	if strings.HasPrefix(userInfo.Avatar, "data:image") {
		avatarFilename, err := utils.SaveImage(userInfo.Avatar)
		if err != nil {
			return fmt.Errorf("invalid image")
		}
		err = u.UserRepo.SaveAvatar(userID, avatarFilename)
		if err != nil {
			return err
		}
	}

	return nil
}

func (u *UserService) UserExist(userID uuid.UUID) bool {
	return u.UserRepo.UserExist(userID)
}
