package services

import (
	"fmt"

	"blank/pkg/app/models"
	"blank/pkg/app/repositories"

	"github.com/gofrs/uuid/v5"
)

type WebSocketService struct {
	UserRepo    *repositories.UserRepository
	MessageRepo *repositories.MessageRepository
}

func (ws *WebSocketService) NotificationService(message models.Message) ([]uuid.UUID, models.Notification) {
	var (
		notification models.Notification
		dists        []uuid.UUID // distinations of the notification
		err          error
	)

	// get the info of the sender
	sender, err := ws.UserRepo.GetPublicUserInfo(message.SenderID)
	if err != nil {
		return nil, models.Notification{
			Type:  "error",
			Label: err.Error(),
		}
	}

	switch message.ReceiverType {
	case "user":
		dists, notification, err = ws.SendMessageToUser(sender, message)
		if err != nil {
			return nil, models.Notification{
				Type:  "error",
				Label: err.Error(),
			}
		}
	case "group":
		dists, notification, err = ws.SendMessageToGroup(sender, message)
		if err != nil {
			return nil, models.Notification{
				Type:  "error",
				Label: err.Error(),
			}
		}
	}

	return dists, notification
}

func (ws *WebSocketService) SendMessageToUser(sender *models.UserInfo, message models.Message) ([]uuid.UUID, models.Notification, error) {
	// check if the receiver user exist
	exist := ws.UserRepo.UserExist(message.ReceiverID)
	if !exist {
		return nil, models.Notification{}, fmt.Errorf("user not found")
	}

	// save the message in the database
	message.ID = uuid.Must(uuid.NewV4())
	err := ws.MessageRepo.SaveMessage(message)
	if err != nil {
		return nil, models.Notification{}, fmt.Errorf("error saving message : %v", err)
	}

	var (
		dists        []uuid.UUID
		notification models.Notification
	)

	dists = append(dists, message.ReceiverID)

	notification = models.Notification{
		Type:    "message",
		Label:   "New Message from " + sender.FirstName + " " + sender.LastName,
		Message: message,
	}

	return dists, notification, nil
}

func (ws *WebSocketService) SendMessageToGroup(sender *models.UserInfo, message models.Message) ([]uuid.UUID, models.Notification, error) {
	var (
		dists        []uuid.UUID
		notification models.Notification
	)

	return dists, notification, nil
}
