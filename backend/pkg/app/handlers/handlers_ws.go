package handlers

import (
	"log"
	"net/http"
	"sync"

	"blank/pkg/app/models"
	"blank/pkg/app/services"

	"github.com/gorilla/websocket"
)

type WebSocketHandler struct {
	UserService    *services.UserService
	GroupService   *services.GroupService
	Upgrader       websocket.Upgrader
	Mutex          sync.Mutex
	ConnectedUsers map[string]*models.ConnectedUser
}

func (ws *WebSocketHandler) Connect(w http.ResponseWriter, r *http.Request) {
	conn, err := ws.Upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("Upgrading error: %#v\n", err)
		return
	}

	userID := "ff"

	ws.connectClient(conn, userID)
	defer ws.disconnectClient(conn, userID)

	for {
		var message models.Message
		err := conn.ReadJSON(&message)
		if err != nil {
			break
		}
		log.Printf("Message received: %+v", message)
	}
}

func (ws *WebSocketHandler) connectClient(conn *websocket.Conn, userID string) {
	ws.Mutex.Lock()
	ws.ConnectedUsers[userID] = &models.ConnectedUser{
		Conn: conn,
	}
	ws.Mutex.Unlock()
	log.Printf("User %s connected\n", userID)
}

func (ws *WebSocketHandler) disconnectClient(conn *websocket.Conn, userID string) {
	ws.Mutex.Lock()
	delete(ws.ConnectedUsers, userID)
	ws.Mutex.Unlock()
	log.Printf("User %s disconnected\n", userID)
	conn.Close()
}
