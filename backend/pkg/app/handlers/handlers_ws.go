package handlers

import (
	"log"
	"net/http"
	"strconv"
	"strings"

	"blank/pkg/app/models"
	"blank/pkg/app/services"
	"blank/pkg/app/utils"

	"github.com/gofrs/uuid/v5"
	"github.com/gorilla/websocket"
)

type WebSocketHandler struct {
	WebSocketService    *services.WebSocketService
	UserService         *services.UserService
	GroupService        *services.GroupService
	SessionService      *services.SessionService
	NotificationService *services.NotificationService
	Upgrader            websocket.Upgrader
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

	err = ws.WebSocketService.ConnectUser(conn, userID)
	if err != nil {
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

func (ws *WebSocketHandler) CommentsGetter(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		utils.SendResponses(w, http.StatusMethodNotAllowed, "Method Not Allowed", nil)
		return
	}
	pathParts := strings.Split(r.URL.Path, "/")
	if len(pathParts) != 6 {
		utils.SendResponses(w, http.StatusNotFound, "Page Not Found", nil)
		return
	}
	var (
		notifications []models.Notification
		page          int
		err           error
	)
	strPage := pathParts[4]
	if strPage == "" {
		utils.SendResponses(w, http.StatusNotFound, "Page Not Found", nil)
		return
	}
	page, err = strconv.Atoi(strPage)
	if err != nil {
		utils.SendResponses(w, http.StatusNotFound, "Page Not Found", nil)
		return
	}

	userID, err := uuid.FromString(r.Context().Value("user_id").(string))
	if err != nil {
		utils.SendResponses(w, http.StatusBadRequest, "Invalid authenticated user ID", nil)
		return
	}

	notifications, err = ws.NotificationService.Notifications(userID, page)
	if err != nil {
		utils.SendResponses(w, http.StatusInternalServerError, "Internal Server Error", nil)
		return
	}

	utils.SendResponses(w, http.StatusOK, "", notifications)
}
