package handlers

import (
	"log"
	"net/http"
	"sync"

	"blank/pkg/app/models"
	"blank/pkg/app/services"
	"blank/pkg/app/utils"

	"github.com/gofrs/uuid/v5"
	"github.com/gorilla/websocket"
)

type WebSocketHandler struct {
	WebSocketService *services.WebSocketService
	UserService      *services.UserService
	GroupService     *services.GroupService
	SessionService   *services.SessionService
	Upgrader         websocket.Upgrader
	Mutex            sync.Mutex
	ConnectedUsers   map[uuid.UUID]*models.ConnectedUser
}

func (ws *WebSocketHandler) Connect(w http.ResponseWriter, r *http.Request) {
	conn, err := ws.Upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("Upgrading error: %#v\n", err)
		utils.SendResponses(w, http.StatusInternalServerError, "Internal Server Error", nil)
		return
	}

	userID, err := uuid.FromString(r.Context().Value("user_id").(string))
	if err != nil {
		utils.SendResponses(w, http.StatusBadRequest, "Invalid authenticated user ID", nil)
		return
	}

	ws.connectClient(conn, userID)
	defer ws.disconnectClient(conn, userID)

	for {
		var message models.Message
		err := conn.ReadJSON(&message)
		if err != nil {
			break
		}

		_, ok := ws.SessionService.CheckSession(message.SessionID)
		if !ok {
			ws.SendNotification([]uuid.UUID{userID}, models.Notification{
				Type:  "error",
				Label: "Your session has expired",
			})
			break
		}

		message.SenderID = userID

		dists, notification := ws.WebSocketService.NotificationService(message)
		if notification.Type == "error" {
			log.Printf("Error sending notification: %v", err)
			ws.SendNotification([]uuid.UUID{userID}, notification)
			continue
		}

		err = ws.SendNotification(dists, notification)
		if err != nil {
			break
		}
	}
}

func (ws *WebSocketHandler) SendNotification(dists []uuid.UUID, notificacion models.Notification) error {
	for _, conn := range ws.ConnectedUsers {
		for _, dist := range dists {
			if conn.User.UserID == dist {
				err := conn.Conn.WriteJSON(notificacion)
				if err != nil {
					return err
				}
			}
		}
	}
	return nil
}

func (ws *WebSocketHandler) connectClient(conn *websocket.Conn, userID uuid.UUID) error {
	user, err := ws.UserService.GetAuthenticatedUser(userID)
	if err != nil {
		return err
	}
	user.UserID = userID

	ws.Mutex.Lock()
	ws.ConnectedUsers[userID] = &models.ConnectedUser{
		Conn: conn,
		User: user,
	}
	ws.Mutex.Unlock()

	log.Printf("%s %s connected\n", user.FirstName, user.LastName)
	return nil
}

func (ws *WebSocketHandler) disconnectClient(conn *websocket.Conn, userID uuid.UUID) {
	name := ws.ConnectedUsers[userID].User.FirstName + " " + ws.ConnectedUsers[userID].User.LastName
	ws.Mutex.Lock()
	delete(ws.ConnectedUsers, userID)
	ws.Mutex.Unlock()
	log.Printf("%s disconnected\n", name)
	conn.Close()
}
