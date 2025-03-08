package services

import (
	"blank/pkg/app/models"
	"blank/pkg/app/repositories"

	"github.com/gofrs/uuid/v5"
)

type MessageService struct {
	MessageRepo *repositories.MessageRepository
	UserRepo    *repositories.UserRepository
}

func (m *MessageService) GetContactUsers(userID string, offset int) ([]models.ContactUser, error) {
	return m.MessageRepo.GetContactUsers(userID, offset)
}

func (m *MessageService) GetUserMessages(authUserID, userID string, offset int) ([]models.MessageHistory, bool, error) {
	authUserIdUUD, _ := uuid.FromString(authUserID)
	userIdUUD, _ := uuid.FromString(userID)

	isFollowing, err := m.UserRepo.IsFollowing(authUserIdUUD, userIdUUD)
	if err != nil {
		return nil, false, err
	}

	isFollower, err := m.UserRepo.IsFollowing(userIdUUD, authUserIdUUD)
	if err != nil {
		return nil, false, err
	}

	if isFollowing || isFollower {
		messages, err := m.MessageRepo.GetUserMessages(authUserID, userID, offset)
		return messages, true, err
	} else {
		return nil, false, nil
	}
}

func (m *MessageService) MarkMessagesAsSeen(receiverID, senderID string) error {
	return m.MessageRepo.MarkMessagesAsSeen(receiverID, senderID)
}

func (m *MessageService) GetGroupChats(userID string, offset int) ([]models.GroupChatInfo, error) {
	return m.MessageRepo.GetGroupChats(userID, offset)
}

func (m *MessageService) GetGroupMessages(groupID string, offset int) ([]models.GroupMessageHistory, error) {
	return m.MessageRepo.GetGroupMessages(groupID, offset)
}

func (m *MessageService) MarkGroupMessagesAsSeen(userID, groupID string) error {
	return m.MessageRepo.MarkGroupMessagesAsSeen(userID, groupID)
}
