package services

import (
	"blank/pkg/app/models"
	"blank/pkg/app/repositories"
)

type MessageService struct {
	MessageRepo *repositories.MessageRepository
	UserRepo    *repositories.UserRepository
}

func (m *MessageService) GetContactUsers(userID string, offset int) ([]models.ContactUser, error) {
	return m.MessageRepo.GetContactUsers(userID, offset)
}

func (m *MessageService) GetUserMessages(authUserID, userID string, offset int) ([]models.MessageHistory, error) {
	return m.MessageRepo.GetUserMessages(authUserID, userID, offset)
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