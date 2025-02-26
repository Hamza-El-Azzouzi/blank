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
	UserService    *services.UserService
	GroupService   *services.GroupService
	Upgrader       websocket.Upgrader
	Mutex          sync.Mutex
	ConnectedUsers map[uuid.UUID]*models.ConnectedUser
}

func (ws *WebSocketHandler) Connect(w http.ResponseWriter, r *http.Request) {
	conn, err := ws.Upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("Upgrading error: %#v\n", err)
		return
	}

	userID, err := uuid.FromString(r.Context().Value("user_id").(string))
	if err != nil {
		utils.SendResponses(w, http.StatusBadRequest, "Invalid authenticated user ID", nil)
		return
	}

	ws.connectClient(conn, userID)
	defer ws.disconnectClient(conn, userID)

	var conns []*websocket.Conn

	for _, conn := range ws.ConnectedUsers {
		conns = append(conns, conn.Conn)
	}

	for {
		var message models.Message
		err := conn.ReadJSON(&message)
		if err != nil {
			break
		}

		ws.SendNotification(conns, models.Notification{
			Type:    "MESSAGE",
			Label:   "New Message from " + ws.ConnectedUsers[userID].User.FirstName + " " + ws.ConnectedUsers[userID].User.LastName,
			Message: message,
		})
	}
}

func (ws *WebSocketHandler) SendNotification(conns []*websocket.Conn, notificacion models.Notification) error {
	log.Printf("Message received: %+v", notificacion.Message)
	for _, conn := range conns {
		err := conn.WriteJSON(notificacion)
		if err != nil {
			return err
		}
	}
	return nil
}

func (ws *WebSocketHandler) connectClient(conn *websocket.Conn, userID uuid.UUID) error {
	user, err := ws.UserService.GetAuthenticatedUser(userID)
	if err != nil {
		return err
	}

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
