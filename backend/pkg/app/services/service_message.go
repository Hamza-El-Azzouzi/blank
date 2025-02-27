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
	messages, err := m.MessageRepo.GetUserMessages(authUserID, userID, offset)
	if err != nil {
		return nil, err
	}

	return messages, nil
}

func (m *MessageService) MarkMessagesAsSeen(receiverID, senderID string) error {
	return m.MessageRepo.MarkMessagesAsSeen(receiverID, senderID)
}
