package services

import (
	"fmt"
	"log"
	"sync"

	"blank/pkg/app/models"
	"blank/pkg/app/repositories"

	"github.com/gofrs/uuid/v5"
	"github.com/gorilla/websocket"
)

type WebSocketService struct {
	UserRepo       *repositories.UserRepository
	MessageRepo    *repositories.MessageRepository
	ConnectedUsers map[uuid.UUID]*models.ConnectedUser
	Mutex          sync.Mutex
}

func (ws *WebSocketService) ReadMessage(message models.Message) ([]uuid.UUID, models.Notification) {
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

func (ws *WebSocketService) SendNotification(dists []uuid.UUID, notification models.Notification) error {
	ws.Mutex.Lock()
	defer ws.Mutex.Unlock()

	for _, dist := range dists {
		if user, ok := ws.ConnectedUsers[dist]; ok {
			for _, conn := range user.Connections {
				err := conn.WriteJSON(notification)
				if err != nil {
					log.Printf("Error sending notification to %s: %v", user.User.FirstName, err)
				}
			}
		}
	}
	return nil
}

func (ws *WebSocketService) ConnectUser(conn *websocket.Conn, userID uuid.UUID) error {
	ws.Mutex.Lock()
	defer ws.Mutex.Unlock()

	// Check if the user already has connections
	if user, exists := ws.ConnectedUsers[userID]; exists {
		user.Connections = append(user.Connections, conn)
	} else {
		user, err := ws.UserRepo.GetPublicUserInfo(userID)
		if err != nil {
			return err
		}
		ws.ConnectedUsers[userID] = &models.ConnectedUser{
			Connections: []*websocket.Conn{conn},
			User:        user,
		}
		log.Printf("%s %s connected\n", user.FirstName, user.LastName)
	}
	return nil
}

func (ws *WebSocketService) DisconnectUser(conn *websocket.Conn, userID uuid.UUID) {
	ws.Mutex.Lock()
	defer ws.Mutex.Unlock()

	if user, exists := ws.ConnectedUsers[userID]; exists {
		for i, c := range user.Connections {
			if c == conn {
				user.Connections = append(user.Connections[:i], user.Connections[i+1:]...)
				break
			}
		}
		conn.Close()

		if len(user.Connections) == 0 {
			delete(ws.ConnectedUsers, userID)
			log.Printf("%s %s disconnected\n", user.User.FirstName, user.User.LastName)
		}
	}
}
