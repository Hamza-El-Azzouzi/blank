package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"strings"
	"sync"
	"time"

	"blank/pkg/app/models"
	"blank/pkg/app/services"

	"github.com/gofrs/uuid/v5"
	"github.com/gorilla/websocket"
)

type MessageHandler struct {
	MessageService *services.MessageService
	AuthService    *services.AuthService
	SessionService *services.SessionService
	Upgrader       websocket.Upgrader
	Clients        map[string]*models.Client
	ClientsMu      sync.Mutex
}

func (m *MessageHandler) MessageReceiver(w http.ResponseWriter, r *http.Request) {
	existSessions := false
	connection, err := m.Upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("Upgrading error: %#v\n", err)
		return
	}

	sessionId, err := r.Cookie("sessionId")

	if err == nil && sessionId.Value != "" {
		existSessions = m.SessionService.CheckSession(sessionId.Value)
	}
	if !existSessions {
		log.Printf("session doesn't exist: %#v\n", err)
	}
	var user *models.User
	var errUser error
	if existSessions {
		user, errUser = m.AuthService.GetUserBySessionID(sessionId.Value)
		if errUser != nil || user.ID == uuid.Nil {
			log.Printf("user error: %#v\n", err)
		}
	}

	var userID string
	if existSessions {
		userID = user.ID.String()
		m.ClientsMu.Lock()
		m.Clients[userID] = &models.Client{
			Conn:     connection,
			LastPing: time.Now(),
		}

		m.ClientsMu.Unlock()
		log.Printf("Client connected: %s\n", userID)

		m.broadcastUserStatus(userID, true)
	}

	defer connection.Close()

	for {

		_, message, err := connection.ReadMessage()
		if err != nil {
			log.Printf("Reading error: %#v\n", err)
			break
		}

		var data map[string]string
		err = json.Unmarshal(message, &data)
		if err != nil {
			log.Printf("Unmarshal error: %#v\n", err)
			continue
		}
		if data["Ask"] == "Who Are You" && existSessions {
			m.ClientsMu.Lock()
			m.Clients[userID].Conn.WriteJSON(map[string]string{
				"username": user.Nickname,
			})
			m.ClientsMu.Unlock()
		}
		if _, ok := data["pimp"]; ok && existSessions {
			user, errUser = m.AuthService.GetUserBySessionID(sessionId.Value)
			if errUser != nil || user.ID == uuid.Nil {
				log.Printf("user error: %#v\n", err)
				break
			}
			m.Clients[data["id"]].Conn.WriteJSON(map[string]string{
				"pimp" : data["pimp"],
				"usernametyper" : user.Nickname,
			})
		}
		if data["type"] == "ping" && existSessions {
			m.ClientsMu.Lock()
			m.Clients[userID].LastPing = time.Now()
			m.ClientsMu.Unlock()

			err = connection.WriteJSON(map[string]string{
				"type": "pong",
			})
			if err != nil {
				log.Printf("Failed to send pong: %#v\n", err)
			}
			continue
		}

		if _, ok := data["msg"]; ok && existSessions {

			if len(strings.TrimSpace(data["msg"])) == 0 {
				log.Println("Empty message received")
				break
			}
			if len(data["msg"]) > 5000 {
				log.Println("message too long")
				break
			}
			userSender, err := m.MessageService.Create(data["msg"], data["session"], data["id"], data["date"])
			if err != nil || userSender == uuid.Nil {
				log.Printf("Failed to create message: %#v\n", err)
				break
			}
			m.ClientsMu.Lock()
			receiverClient, exists := m.Clients[data["id"]]
			m.ClientsMu.Unlock()
			data["session"] = userSender.String()
			data["senderUserName"] = user.Nickname
			if exists {
				err = receiverClient.Conn.WriteJSON(data)
				if err != nil {
					log.Printf("Failed to send message to receiver: %#v\n", err)
				}
			} else {
				log.Printf("Receiver %s not found\n", data["id"])
			}
		}
		if _, ok := data["user"]; ok {
			for _, client := range m.Clients {
				err := client.Conn.WriteJSON(data)
				if err != nil {
					log.Printf("Failed to broadcast user status: %#v\n", err)
				}
			}
		}
	}

	m.DisconnectClient(userID)
}

func (m *MessageHandler) DisconnectClient(userID string) {
	m.ClientsMu.Lock()
	delete(m.Clients, userID)
	m.ClientsMu.Unlock()
	m.broadcastUserStatus(userID, false)
	log.Printf("User %s disconnected\n", userID)
}

func (m *MessageHandler) broadcastUserStatus(userID string, isOnline bool) {
	m.ClientsMu.Lock()
	defer m.ClientsMu.Unlock()

	for _, client := range m.Clients {
		err := client.Conn.WriteJSON(map[string]any{
			"type":   "userStatus",
			"userID": userID,
			"online": isOnline,
		})
		if err != nil {
			log.Printf("Failed to broadcast user status: %#v\n", err)
		}
	}
}

func (m *MessageHandler) GetOnlineUsers(w http.ResponseWriter, r *http.Request) {
	m.ClientsMu.Lock()
	defer m.ClientsMu.Unlock()

	onlineUsers := []string{}
	for userID := range m.Clients {
		onlineUsers = append(onlineUsers, userID)
	}

	w.Header().Set("Content-Type", "application/json")
	err := json.NewEncoder(w).Encode(onlineUsers)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
	}
}

func (m *MessageHandler) GetMessages(w http.ResponseWriter, r *http.Request) {
	chat := models.HistoryChat{}
	decoder := json.NewDecoder(r.Body)
	err := decoder.Decode(&chat)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
	}
	defer r.Body.Close()
	messages, err := m.MessageService.GetMessages(chat.SnederID, chat.ReceiverID, chat.Offset)
	if err != nil {
		return
	}
	w.Header().Set("Content-Type", "application/json")
	err = json.NewEncoder(w).Encode(messages)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
	}
}

func (m *MessageHandler) UnReadMessages(w http.ResponseWriter, r *http.Request) {
	var session models.Session
	decoder := json.NewDecoder(r.Body)
	err := decoder.Decode(&session)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	defer r.Body.Close()

	usersID, err := m.MessageService.CheckUnReadMsg(session.SessionID)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	err = json.NewEncoder(w).Encode(usersID)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
	}
}

func (m *MessageHandler) MarkReadMessages(w http.ResponseWriter, r *http.Request) {
	var data models.MarkAsRead
	decoder := json.NewDecoder(r.Body)
	err := decoder.Decode(&data)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	defer r.Body.Close()

	err = m.MessageService.MarkReadMsg(data)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
	}
}
