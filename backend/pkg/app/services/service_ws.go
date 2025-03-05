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
	UserRepo         *repositories.UserRepository
	GroupRepo        *repositories.GroupRepository
	MessageRepo      *repositories.MessageRepository
	NotificationRepo *repositories.NotificationRepository
	ConnectedUsers   map[uuid.UUID]*models.ConnectedUser
	Mutex            sync.Mutex
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

	message.ID = uuid.Must(uuid.NewV4())

	switch message.ReceiverType {
	case "to_user":
		dists, notification, err = ws.SendMessageToUser(sender, message)
		if err != nil {
			return nil, models.Notification{
				Type:  "error",
				Label: err.Error(),
			}
		}
	case "to_group":
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
	// check if the user receiver user exist
	exist := ws.UserRepo.UserExist(message.ReceiverID)
	if !exist {
		return nil, models.Notification{}, fmt.Errorf("user not found")
	}

	// save the message in the database
	err := ws.MessageRepo.SaveMessageToUser(message)
	if err != nil {
		return nil, models.Notification{}, fmt.Errorf("error saving message : %v", err)
	}

	var (
		dists        []uuid.UUID
		notification models.Notification
	)

	isPublic, err := ws.UserRepo.GetUserPrivacy(message.ReceiverID)
	if err != nil {
		return nil, models.Notification{}, fmt.Errorf("error getting user privacy: %v", err)
	}

	isFollowing, err := ws.UserRepo.IsFollowing(message.ReceiverID, message.SenderID)
	if err != nil {
		return nil, models.Notification{}, fmt.Errorf("error getting is following: %v", err)
	}

	if isPublic || isFollowing {
		dists = append(dists, message.ReceiverID)
	}

	notification = models.Notification{
		Type:    "message",
		Label:   "New Message from " + sender.FirstName + " " + sender.LastName,
		Message: message,
	}

	return dists, notification, nil
}

func (ws *WebSocketService) SendMessageToGroup(sender *models.UserInfo, message models.Message) ([]uuid.UUID, models.Notification, error) {
	// check if the group receiver user exist
	exist, err := ws.GroupRepo.GroupExist(message.ReceiverID)
	if !exist {
		if err != nil {
			return nil, models.Notification{}, err
		}
		return nil, models.Notification{}, fmt.Errorf("group not found")
	}

	// check if the user is member of the group
	isMember, err := ws.GroupRepo.IsGroupMember(message.ReceiverID.String(), message.SenderID.String())
	if !isMember {
		if err != nil {
			return nil, models.Notification{}, err
		}
		return nil, models.Notification{}, fmt.Errorf("you are not member of the group")
	}

	// save the message in the database
	err = ws.MessageRepo.SaveMessageToGroup(message)
	if err != nil {
		return nil, models.Notification{}, fmt.Errorf("error saving message : %v", err)
	}

	var notification models.Notification

	groupMembers, err := ws.GroupRepo.GetGroupMembers(message.SenderID, message.ReceiverID)
	if err != nil {
		return nil, models.Notification{}, err
	}

	groupName, err := ws.GroupRepo.GetGroupTitle(message.ReceiverID)
	if err != nil {
		return nil, models.Notification{}, err
	}

	notification = models.Notification{
		Type:      "message",
		Label:     groupName + ": New Group Message from " + sender.FirstName,
		Message:   message,
		FirstName: sender.FirstName,
		LastName:  sender.LastName,
		Avatar:    sender.Avatar,
	}

	return groupMembers, notification, nil
}

func (ws *WebSocketService) SendNotification(dists []uuid.UUID, notification models.Notification) error {
	ws.Mutex.Lock()
	defer ws.Mutex.Unlock()

	// save the notification in the database for each receiver
	if notification.Type != "message" {
		notification.ID = uuid.Must(uuid.NewV4())
		for _, receiver := range dists {
			notification.ReceiverID = receiver
			if notification.Type == "event" || notification.Type == "group_invitation" {
				err := ws.NotificationRepo.CreateGroupNotification(notification)
				if err != nil {
					return err
				}
			} else if notification.Type == "join_request" {
				err := ws.NotificationRepo.CreateGroupJoinRequestNotif(notification)
				if err != nil {
					return err
				}
			} else if notification.Type == "follow_request" || notification.Type == "follow" {
				err := ws.NotificationRepo.CreateUserNotification(notification)
				if err != nil {
					log.Println(err)
					return err
				}
			}
		}
	}

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
