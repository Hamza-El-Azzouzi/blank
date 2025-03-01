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

func (u *UserService) GetUserInfo(userID, authUserID uuid.UUID) (*models.UserInfo, error) {
	isPublic, err := u.UserRepo.GetUserPrivacy(userID)
	if err != nil {
		return nil, err
	}

	isFollowing, err := u.UserRepo.IsFollowing(authUserID, userID)
	if err != nil {
		return nil, err
	}

	var userInfo *models.UserInfo

	if (userID == authUserID) || isPublic || (!isPublic && isFollowing) {
		userInfo, err = u.UserRepo.GetAllUserInfo(userID)
		if err != nil {
			return nil, err
		}
	} else {
		userInfo, err = u.UserRepo.GetPublicUserInfo(userID)
		if err != nil {
			return nil, err
		}
	}
	userInfo.IsFollowing = isFollowing
	return userInfo, nil
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

const usersPerPage = 10

func (u *UserService) SearchUsers(query string, page int) ([]models.UserInfo, bool, error) {
	if query == "" {
		return []models.UserInfo{}, false, nil
	}

	offset := (page - 1) * usersPerPage
	users, total, err := u.UserRepo.SearchUsers(query, usersPerPage, offset)
	if err != nil {
		return nil, false, err
	}

	hasMore := total > (offset + len(users))

	return users, hasMore, nil
}

func (u *UserService) UserExist(userID uuid.UUID) bool {
	return u.UserRepo.UserExist(userID)
}

func (u *UserService) GetAuthenticatedUser(authUserID uuid.UUID) (*models.UserInfo, error) {
	return u.UserRepo.GetAllUserInfo(authUserID)
}
