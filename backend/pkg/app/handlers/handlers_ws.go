package handlers

import (
	"log"
	"net/http"

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

	if err := ws.WebSocketService.ConnectUser(conn, userID); err != nil {
		utils.SendResponses(w, http.StatusInternalServerError, "Internal Server Error", nil)
		return
	}
	defer ws.WebSocketService.DisconnectUser(conn, userID)

	for {
		var message models.Message
		err := conn.ReadJSON(&message)
		if err != nil {
			break
		}

		_, ok := ws.SessionService.CheckSession(message.SessionID)
		if !ok {
			ws.WebSocketService.SendNotification([]uuid.UUID{userID}, models.Notification{
				Type:  "error",
				Label: "Your session has expired",
			})
			break
		}

		message.SenderID = userID
		if message.SenderID == message.ReceiverID {
			ws.WebSocketService.SendNotification([]uuid.UUID{userID}, models.Notification{
				Type:  "error",
				Label: "You can't send a message to yourself !",
			})
			continue
		}
		
		if message.ReceiverType == "to_user" {
			if ok, err := ws.UserService.CanSendMessage(message.SenderID, message.ReceiverID); !ok || err != nil {
				if err != nil {
					ws.WebSocketService.SendNotification([]uuid.UUID{userID}, models.Notification{
						Type:  "error",
						Label: "something wrong happend",
					})
					continue
				}

				ws.WebSocketService.SendNotification([]uuid.UUID{userID}, models.Notification{
					Type:  "error",
					Label: "You can't send a message, follow the user first!",
				})
				continue
			}
		}

		dists, notification := ws.WebSocketService.ReadMessage(message)
		if notification.Type == "error" {
			log.Printf("Error sending notification: %v", err)
			ws.WebSocketService.SendNotification([]uuid.UUID{userID}, notification)
			continue
		}

		err = ws.WebSocketService.SendNotification(dists, notification)
		if err != nil {
			break
		}
	}
}
