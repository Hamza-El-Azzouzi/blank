package handlers

import (
	"log"
	"net/http"
	"strconv"

	"blank/pkg/app/services"
	"blank/pkg/app/utils"

	"github.com/gofrs/uuid/v5"
)

type MessageHandler struct {
	MessageService *services.MessageService
	AuthService    *services.AuthService
	SessionService *services.SessionService
	GroupService   *services.GroupService
}

func (m *MessageHandler) GetContactUsers(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		utils.SendResponses(w, http.StatusMethodNotAllowed, "Method Not Allowed", nil)
		return
	}

	userID := r.Context().Value("user_id").(string)

	offset := 0
	if offsetStr := r.URL.Query().Get("offset"); offsetStr != "" {
		var err error
		offset, err = strconv.Atoi(offsetStr)
		if err != nil {
			utils.SendResponses(w, http.StatusBadRequest, "invalid offset", nil)
			return
		}
	}

	contacts, err := m.MessageService.GetContactUsers(userID, offset)
	if err != nil {
		log.Println(err)
		utils.SendResponses(w, http.StatusInternalServerError, "Failed to get contacts", nil)
		return
	}

	utils.SendResponses(w, http.StatusOK, "Success", contacts)
}

func (m *MessageHandler) GetUserMessages(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		utils.SendResponses(w, http.StatusMethodNotAllowed, "Method Not Allowed", nil)
		return
	}

	authUserID := r.Context().Value("user_id").(string)

	userID := r.PathValue("user_id")
	_, err := uuid.FromString(r.PathValue("user_id"))
	if err != nil {
		utils.SendResponses(w, http.StatusBadRequest, "invalid userid", nil)
	}

	offset := 0
	if offsetStr := r.URL.Query().Get("offset"); offsetStr != "" {
		var err error
		offset, err = strconv.Atoi(offsetStr)
		if err != nil {
			utils.SendResponses(w, http.StatusBadRequest, "invalid offset", nil)
			return
		}
	}

	messages, err := m.MessageService.GetUserMessages(authUserID, userID, offset)
	if err != nil {
		utils.SendResponses(w, http.StatusInternalServerError, "Failed to get messages", nil)
		return
	}

	utils.SendResponses(w, http.StatusOK, "success", messages)
}

func (m *MessageHandler) MarkMessagesAsSeen(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPatch {
		utils.SendResponses(w, http.StatusMethodNotAllowed, "Method Not Allowed", nil)
		return
	}

	receiverID := r.Context().Value("user_id").(string)

	senderID := r.PathValue("user_id")
	_, err := uuid.FromString(r.PathValue("user_id"))
	if err != nil {
		utils.SendResponses(w, http.StatusBadRequest, "invalid userid", nil)
	}

	err = m.MessageService.MarkMessagesAsSeen(receiverID, senderID)
	if err != nil {
		utils.SendResponses(w, http.StatusInternalServerError, "Failed to mark messages as seen", nil)
		return
	}

	utils.SendResponses(w, http.StatusOK, "Messages marked as seen", nil)
}

func (m *MessageHandler) GetGroupChats(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		utils.SendResponses(w, http.StatusMethodNotAllowed, "Method Not Allowed", nil)
		return
	}

	userID := r.Context().Value("user_id").(string)

	offset := 0
	if offsetStr := r.URL.Query().Get("offset"); offsetStr != "" {
		var err error
		offset, err = strconv.Atoi(offsetStr)
		if err != nil {
			utils.SendResponses(w, http.StatusBadRequest, "invalid offset", nil)
			return
		}
	}

	groupChats, err := m.MessageService.GetGroupChats(userID, offset)
	if err != nil {
		log.Println(err)
		utils.SendResponses(w, http.StatusInternalServerError, "Failed to get group chats", nil)
		return
	}

	utils.SendResponses(w, http.StatusOK, "Success", groupChats)
}

func (m *MessageHandler) GetGroupMessages(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		utils.SendResponses(w, http.StatusMethodNotAllowed, "Method Not Allowed", nil)
		return
	}

	groupID := r.PathValue("group_id")
	_, err := uuid.FromString(groupID)
	if err != nil {
		utils.SendResponses(w, http.StatusBadRequest, "invalid group id", nil)
		return
	}

	offset := 0
	if offsetStr := r.URL.Query().Get("offset"); offsetStr != "" {
		var err error
		offset, err = strconv.Atoi(offsetStr)
		if err != nil {
			utils.SendResponses(w, http.StatusBadRequest, "invalid offset", nil)
			return
		}
	}

	userID := r.Context().Value("user_id").(string)

	if isMember := m.GroupService.IsGroupMember(groupID, userID); !isMember {
		utils.SendResponses(w, http.StatusUnauthorized, "you dont have the permession to join group chat", nil)
		return
	}

	messages, err := m.MessageService.GetGroupMessages(groupID, offset)
	if err != nil {
		utils.SendResponses(w, http.StatusInternalServerError, "Failed to get messages", nil)
		return
	}

	utils.SendResponses(w, http.StatusOK, "success", messages)
}

func (m *MessageHandler) MarkGroupMessagesAsSeen(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPatch {
		utils.SendResponses(w, http.StatusMethodNotAllowed, "Method Not Allowed", nil)
		return
	}

	userID := r.Context().Value("user_id").(string)
	groupID := r.PathValue("group_id")
	_, err := uuid.FromString(groupID)
	if err != nil {
		utils.SendResponses(w, http.StatusBadRequest, "invalid group id", nil)
		return
	}

	err = m.MessageService.MarkGroupMessagesAsSeen(userID, groupID)
	if err != nil {
		utils.SendResponses(w, http.StatusInternalServerError, "Failed to mark messages as seen", nil)
		return
	}

	utils.SendResponses(w, http.StatusOK, "Messages marked as seen", nil)
}
