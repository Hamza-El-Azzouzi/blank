package services

import (
	"database/sql"
	"fmt"
	"strings"

	"blank/pkg/app/models"
	"blank/pkg/app/repositories"
	"blank/pkg/app/utils"

	"github.com/gofrs/uuid/v5"
)

type UserService struct {
	UserRepo         *repositories.UserRepository
	GroupRepo        *repositories.GroupRepository
	NotificationRepo *repositories.NotificationRepository
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

func (u *UserService) SearchUsers(query string, page int, authUserID uuid.UUID) ([]models.UserInfo, bool, error) {
	if query == "" {
		return []models.UserInfo{}, false, nil
	}

	offset := (page - 1) * usersPerPage
	users, total, err := u.UserRepo.SearchUsers(query, usersPerPage, offset)
	if err != nil {
		return nil, false, err
	}

	hasMore := total > (offset + len(users))

	for i := range users {
		if users[i].UserID == authUserID {
			users[i].CanSendMessage = false
			continue
		}

		isFollowing, err := u.UserRepo.IsFollowing(authUserID, users[i].UserID)
		if err != nil {
			return nil, false, err
		}

		isFollower, err := u.UserRepo.IsFollowing(users[i].UserID, authUserID)
		if err != nil {
			return nil, false, err
		}

		if users[i].IsPublic || isFollowing || isFollower {
			users[i].CanSendMessage = true
		} else {
			users[i].CanSendMessage = false
		}
	}

	return users, hasMore, nil
}

func (u *UserService) UserExist(userID uuid.UUID) bool {
	return u.UserRepo.UserExist(userID)
}

func (u *UserService) GetAuthenticatedUser(authUserID uuid.UUID) (*models.UserInfo, error) {
	return u.UserRepo.GetAllUserInfo(authUserID)
}

func (u *UserService) GetPublicUserInfo(authUserID uuid.UUID) (*models.UserInfo, error) {
	return u.UserRepo.GetPublicUserInfo(authUserID)
}

func (u *UserService) Notifications(authUserID uuid.UUID, page int) ([]models.NotificationResponse, error) {
	limit := 20
	offset := page * limit

	notifications, err := u.NotificationRepo.GetNotifications(authUserID, offset, limit)
	if err != nil {
		return nil, err
	}
	var cleanNotifications []models.NotificationResponse

	for _, notif := range notifications {
		cleanNotif := models.NotificationResponse{
			ID:            notif.ID.String(),
			ReceiverID:    authUserID.String(),
			Type:          notif.Type,
			Seen:          notif.Seen,
			FormattedDate: notif.FormattedDate,
		}

		switch notif.Type {
		case "follow_request":
			pending, err := u.UserRepo.CheckFollowRequestPending(authUserID, notif.UserID.UUID)
			if err != nil {
				return nil, err
			}
			if pending {
				lastNotifID, err := u.NotificationRepo.LastUserNotification(authUserID, notif.UserID.UUID, notif.Type)
				if err != nil {
					return nil, err
				}
				if lastNotifID == notif.ID {
					cleanNotif.AllowAction = true
				}
			}
		case "group_invitation":
			pending, err := u.GroupRepo.CheckGroupInvitationPending(notif.ID, authUserID, notif.GroupID.UUID)
			if err != nil {
				return nil, err
			}
			if pending {
				lastNotifID, err := u.NotificationRepo.LastGroupNotification(authUserID, notif.GroupID.UUID, notif.Type)
				if err != nil {
					return nil, err
				}
				if lastNotifID == notif.ID {
					cleanNotif.AllowAction = true
				}
			}
		case "join_request":
			userInfo, err := u.UserRepo.GetPublicUserInfo(notif.UserID.UUID)
			if err != nil {
				return nil, err
			}
			notif.UserName = sql.NullString{String: userInfo.FirstName + " " + userInfo.LastName, Valid: true}
		}

		if notif.UserID.Valid {
			cleanNotif.UserID = notif.UserID.UUID.String()
		}
		if notif.UserName.Valid {
			cleanNotif.UserName = notif.UserName.String
		}
		if notif.GroupID.Valid {
			cleanNotif.GroupID = notif.GroupID.UUID.String()
		}
		if notif.GroupTitle.Valid {
			cleanNotif.GroupTitle = notif.GroupTitle.String
		}
		cleanNotifications = append(cleanNotifications, cleanNotif)
	}
	return cleanNotifications, nil
}

func (u *UserService) SeeNotification(userID, notifID uuid.UUID) error {
	return u.NotificationRepo.SeeNotification(userID, notifID)
}
