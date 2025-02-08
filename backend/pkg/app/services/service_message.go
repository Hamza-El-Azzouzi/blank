package services

import (
	"fmt"

	"blank/pkg/app/models"
	"blank/pkg/app/repositories"

	"github.com/gofrs/uuid/v5"
)

type MessageService struct {
	MessageRepo *repositories.MessageRepository
	UserRepo    *repositories.UserRepository
}

func (m *MessageService) Create(msg, session, id, date string) (uuid.UUID, error) {
	user, err := m.UserRepo.GetUserBySessionID(session)
	if err != nil {
		return uuid.Nil, err
	}
	messageId := uuid.Must(uuid.NewV4())

	return user.ID, m.MessageRepo.Create(messageId, msg, id, user.ID, date)
}

func (m *MessageService) GetMessages(senderID, receiverID string, pagination int) ([]models.MessageWithTime, error) {
	user, err := m.UserRepo.GetUserBySessionID(senderID)
	if err != nil {
		return nil, err
	}

	messages, err := m.MessageRepo.GetMessages(user.ID.String(), receiverID, pagination)
	if err != nil {
		return nil, fmt.Errorf("error Kayn f All messages service : %v", err)
	}
	return messages, nil
}

func (m *MessageService) CheckUnReadMsg(sessionId string) ([]string, error) {
	user, err := m.UserRepo.GetUserBySessionID(sessionId)
	if err != nil {
		return nil, err
	}

	messages, err := m.MessageRepo.CheckUnReadMsg(user.ID.String())
	if err != nil {
		return nil, fmt.Errorf("error Kayn f All messages service : %v", err)
	}
	return messages, nil
}

func (m *MessageService) MarkReadMsg(markRead models.MarkAsRead) error {
	user, err := m.UserRepo.GetUserBySessionID(markRead.ReceiverID)
	if err != nil {
		return err
	}

	err = m.MessageRepo.MarkReadMsg(markRead.SenderID, user.ID)
	if err != nil {
		return fmt.Errorf("error : %v", err)
	}
	return nil
}
