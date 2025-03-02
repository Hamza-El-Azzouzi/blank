package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"blank/pkg/app/models"
	"blank/pkg/app/services"
	"blank/pkg/app/utils"

	"github.com/gofrs/uuid/v5"
)

type GroupHandler struct {
	GroupService     *services.GroupService
	UserService      *services.UserService
	WebSocketService *services.WebSocketService
}

func (g *GroupHandler) CreateGroup(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		utils.SendResponses(w, http.StatusBadRequest, "Bad request", nil)
		return
	}
	if r.Header.Get("Content-Type") != "application/json" {
		utils.SendResponses(w, http.StatusUnsupportedMediaType, "content-Type must be application/json", nil)
		return
	}

	var group models.Group
	err := json.NewDecoder(r.Body).Decode(&group)
	if err != nil {

		utils.SendResponses(w, http.StatusBadRequest, "invalid JSON data", nil)
		return
	}
	user_id, ok := r.Context().Value("user_id").(string)
	if !ok {
		utils.SendResponses(w, http.StatusBadRequest, "user id Most be String", nil)
	}
	groupCreation, err := g.GroupService.CreateGroup(group, user_id)
	if err != nil {
		switch err.Error() {
		case "title and description are required":
			utils.SendResponses(w, http.StatusBadRequest, err.Error(), nil)
		case "title must be less than 50 characters and description less than 200 characters":
			utils.SendResponses(w, http.StatusBadRequest, err.Error(), nil)
		default:
			utils.SendResponses(w, http.StatusInternalServerError, "Internal Server Error", nil)
		}
		return
	}
	utils.SendResponses(w, http.StatusCreated, "Created successfully", groupCreation)
}

func (g *GroupHandler) Groups(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		utils.SendResponses(w, http.StatusBadRequest, "Bad request", nil)
		return
	}
	if r.Header.Get("Content-Type") != "application/json" {
		utils.SendResponses(w, http.StatusUnsupportedMediaType, "content-Type must be application/json", nil)
		return
	}
	pathParts := strings.Split(r.URL.Path, "/")
	if len(pathParts) != 4 {
		utils.SendResponses(w, http.StatusNotFound, "Not Found", nil)
		return
	}
	user_id, ok := r.Context().Value("user_id").(string)
	if !ok {
		utils.SendResponses(w, http.StatusBadRequest, "user id Most be String", nil)
	}
	page, err := strconv.Atoi(pathParts[3])
	if err != nil {
		utils.SendResponses(w, http.StatusBadRequest, "Bad request", nil)
		return
	}
	groups, err := g.GroupService.Groups(user_id, page)
	if err != nil {

		utils.SendResponses(w, http.StatusInternalServerError, "Internal Server Error", nil)
		return
	}
	utils.SendResponses(w, http.StatusOK, "Created successfully", groups)
}

func (g *GroupHandler) GroupSearch(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		utils.SendResponses(w, http.StatusBadRequest, "Bad request", nil)
		return
	}
	if r.Header.Get("Content-Type") != "application/json" {
		utils.SendResponses(w, http.StatusUnsupportedMediaType, "content-Type must be application/json", nil)
		return
	}
	user_id, ok := r.Context().Value("user_id").(string)
	if !ok {
		utils.SendResponses(w, http.StatusBadRequest, "user id Most be String", nil)
	}
	term := r.URL.Query().Get("q")
	groups, err := g.GroupService.GroupsSearch(user_id, term)
	if err != nil {
		switch err.Error() {
		case "search term is required":
			utils.SendResponses(w, http.StatusBadRequest, err.Error(), nil)
		case "search term must be less than 50 characters":
			utils.SendResponses(w, http.StatusBadRequest, err.Error(), nil)
		case "search term must contain only letters, numbers and spaces":
			utils.SendResponses(w, http.StatusBadRequest, err.Error(), nil)
		default:
			utils.SendResponses(w, http.StatusInternalServerError, "Internal Server Error", nil)
		}
		return
	}
	utils.SendResponses(w, http.StatusOK, "Success", groups)
}

func (g *GroupHandler) GroupDetails(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		utils.SendResponses(w, http.StatusBadRequest, "Bad request", nil)
		return
	}
	if r.Header.Get("Content-Type") != "application/json" {
		utils.SendResponses(w, http.StatusUnsupportedMediaType, "content-Type must be application/json", nil)
		return
	}

	pathParts := strings.Split(r.URL.Path, "/")
	if len(pathParts) != 4 {
		utils.SendResponses(w, http.StatusNotFound, "Not Found", nil)
		return
	}
	user_id, ok := r.Context().Value("user_id").(string)
	if !ok {
		utils.SendResponses(w, http.StatusBadRequest, "user id Most be String", nil)
	}
	GroupDerails, err := g.GroupService.GroupDetails(user_id, pathParts[3])
	if err != nil {
		switch err.Error() {
		case "forbidden":
			utils.SendResponses(w, http.StatusForbidden, err.Error(), nil)
		default:
			utils.SendResponses(w, http.StatusInternalServerError, "Internal Server Error", nil)
		}
		return
	}

	utils.SendResponses(w, http.StatusOK, "Success", GroupDerails)
}

func (g *GroupHandler) JoinGroup(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		utils.SendResponses(w, http.StatusBadRequest, "Bad request", nil)
		return
	}
	if r.Header.Get("Content-Type") != "application/json" {
		utils.SendResponses(w, http.StatusUnsupportedMediaType, "content-Type must be application/json", nil)
		return
	}

	pathParts := strings.Split(r.URL.Path, "/")
	if len(pathParts) != 5 {
		utils.SendResponses(w, http.StatusNotFound, "Not Found", nil)
		return
	}
	if pathParts[4] != "invited" && pathParts[4] != "requested" {
		utils.SendResponses(w, http.StatusNotFound, "Not Found", nil)
		return
	}
	user_id, ok := r.Context().Value("user_id").(string)
	if !ok {
		utils.SendResponses(w, http.StatusBadRequest, "user id Most be String", nil)
	}
	err := g.GroupService.JoinGroup(pathParts[3], user_id, pathParts[4])
	if err != nil {
		switch err.Error() {
		case "forbidden":
			utils.SendResponses(w, http.StatusForbidden, err.Error(), nil)
		default:
			utils.SendResponses(w, http.StatusInternalServerError, "Internal Server Error", nil)
		}
		return
	}

	userID, _ := uuid.FromString(user_id)
	GroupID, err := uuid.FromString(pathParts[3])
	if err != nil {
		utils.SendResponses(w, http.StatusBadRequest, "Bad request", nil)
		return
	}

	OwnerID, groupTitle, err := g.GroupService.GetGroupOwner(GroupID)
	if err != nil {
		utils.SendResponses(w, http.StatusBadRequest, "Bad request", nil)
		return
	}

	user, err := g.UserService.GetPublicUserInfo(userID)
	if err != nil {
		utils.SendResponses(w, http.StatusInternalServerError, "Internal Server Error", nil)
		return
	}

	g.WebSocketService.SendNotification([]uuid.UUID{OwnerID}, models.Notification{
		Type:      "join_request",
		GroupID:   GroupID,
		UserName:  user.FirstName + " " + user.LastName,
		Avatar:    user.Avatar,
		Label:     fmt.Sprintf(`%s %s requested to join %s`, user.FirstName, user.LastName, groupTitle),
		CreatedAt: time.Now(),
	})

	utils.SendResponses(w, http.StatusOK, "Request sent successfully", nil)
}

func (g *GroupHandler) GroupDelete(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodDelete {
		utils.SendResponses(w, http.StatusBadRequest, "Bad request", nil)
		return
	}
	if r.Header.Get("Content-Type") != "application/json" {
		utils.SendResponses(w, http.StatusUnsupportedMediaType, "content-Type must be application/json", nil)
		return
	}

	pathParts := strings.Split(r.URL.Path, "/")
	if len(pathParts) != 5 {
		utils.SendResponses(w, http.StatusNotFound, "Not Found", nil)
		return
	}
	user_id, ok := r.Context().Value("user_id").(string)
	if !ok {
		utils.SendResponses(w, http.StatusBadRequest, "user id Most be String", nil)
	}
	err := g.GroupService.GroupDelete(pathParts[3], user_id)
	if err != nil {

		utils.SendResponses(w, http.StatusInternalServerError, "Internal Server Error", nil)
		return
	}
	utils.SendResponses(w, http.StatusOK, "Created successfully", nil)
}

func (g *GroupHandler) GroupRequest(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		utils.SendResponses(w, http.StatusBadRequest, "Bad request", nil)
		return
	}
	if r.Header.Get("Content-Type") != "application/json" {
		utils.SendResponses(w, http.StatusUnsupportedMediaType, "content-Type must be application/json", nil)
		return
	}

	pathParts := strings.Split(r.URL.Path, "/")
	if len(pathParts) != 6 {
		utils.SendResponses(w, http.StatusNotFound, "Not Found", nil)
		return
	}
	page, err := strconv.Atoi(pathParts[5])
	if err != nil {
		utils.SendResponses(w, http.StatusBadRequest, "Bad request", nil)
		return
	}
	user_id, ok := r.Context().Value("user_id").(string)
	if !ok {
		utils.SendResponses(w, http.StatusBadRequest, "user id Most be String", nil)
	}
	groupRequest, err := g.GroupService.GroupRequest(pathParts[3], user_id, page)
	if err != nil {

		utils.SendResponses(w, http.StatusInternalServerError, "Internal Server Error", nil)
		return
	}
	utils.SendResponses(w, http.StatusOK, "Created successfully", groupRequest)
}

func (g *GroupHandler) GroupResponse(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		utils.SendResponses(w, http.StatusBadRequest, "Bad request", nil)
		return
	}
	if r.Header.Get("Content-Type") != "application/json" {
		utils.SendResponses(w, http.StatusUnsupportedMediaType, "content-Type must be application/json", nil)
		return
	}

	pathParts := strings.Split(r.URL.Path, "/")

	if len(pathParts) != 5 {
		utils.SendResponses(w, http.StatusNotFound, "Not Found", nil)
		return
	}
	var groupResponse models.GroupResponse
	err := json.NewDecoder(r.Body).Decode(&groupResponse)
	if err != nil {

		utils.SendResponses(w, http.StatusBadRequest, "invalid JSON data", nil)
		return
	}
	user_id, ok := r.Context().Value("user_id").(string)
	if !ok {
		utils.SendResponses(w, http.StatusBadRequest, "user id Most be String", nil)
	}
	memberCount, err := g.GroupService.GroupResponse(pathParts[3], user_id, groupResponse)
	if err != nil {

		utils.SendResponses(w, http.StatusInternalServerError, "Internal Server Error", nil)
		return
	}
	utils.SendResponses(w, http.StatusOK, "Created successfully", memberCount)
}

func (g *GroupHandler) GroupeLeave(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		utils.SendResponses(w, http.StatusBadRequest, "Bad request", nil)
		return
	}
	if r.Header.Get("Content-Type") != "application/json" {
		utils.SendResponses(w, http.StatusUnsupportedMediaType, "content-Type must be application/json", nil)
		return
	}

	pathParts := strings.Split(r.URL.Path, "/")

	if len(pathParts) != 5 {
		utils.SendResponses(w, http.StatusNotFound, "Not Found", nil)
		return
	}
	user_id, ok := r.Context().Value("user_id").(string)
	if !ok {
		utils.SendResponses(w, http.StatusBadRequest, "user id Most be String", nil)
	}
	_, err := g.GroupService.GroupLeave(pathParts[3], user_id)
	if err != nil {
		utils.SendResponses(w, http.StatusInternalServerError, "Internal Server Error", nil)
		return
	}
	utils.SendResponses(w, http.StatusOK, "Created successfully", nil)
}

func (g *GroupHandler) GroupCreatePost(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		utils.SendResponses(w, http.StatusBadRequest, "Bad request", nil)
		return
	}
	if r.Header.Get("Content-Type") != "application/json" {
		utils.SendResponses(w, http.StatusUnsupportedMediaType, "content-Type must be application/json", nil)
		return
	}

	pathParts := strings.Split(r.URL.Path, "/")

	if len(pathParts) != 5 {
		utils.SendResponses(w, http.StatusNotFound, "Not Found", nil)
		return
	}

	user_id, ok := r.Context().Value("user_id").(string)
	if !ok {
		utils.SendResponses(w, http.StatusBadRequest, "user id Most be String", nil)
	}
	var postInfo models.GroupPost
	err := json.NewDecoder(r.Body).Decode(&postInfo)
	if err != nil {

		utils.SendResponses(w, http.StatusBadRequest, "invalid JSON data", nil)
		return
	}
	newPost, err := g.GroupService.GroupCreatePost(postInfo, user_id)
	if err != nil {
		utils.SendResponses(w, http.StatusInternalServerError, "Internal Server Error", nil)
		return
	}
	utils.SendResponses(w, http.StatusOK, "Created successfully", newPost)
}

func (g *GroupHandler) GroupPosts(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		utils.SendResponses(w, http.StatusBadRequest, "Bad request", nil)
		return
	}
	if r.Header.Get("Content-Type") != "application/json" {
		utils.SendResponses(w, http.StatusUnsupportedMediaType, "content-Type must be application/json", nil)
		return
	}

	pathParts := strings.Split(r.URL.Path, "/")
	if len(pathParts) != 6 {
		utils.SendResponses(w, http.StatusNotFound, "Not Found", nil)
		return
	}

	user_id, ok := r.Context().Value("user_id").(string)
	if !ok {
		utils.SendResponses(w, http.StatusBadRequest, "user id Most be String", nil)
	}
	pag, err := strconv.Atoi(pathParts[5])
	if err != nil {
		utils.SendResponses(w, http.StatusBadRequest, "Bad request", nil)
		return
	}
	groupPost, err := g.GroupService.GroupPost(pathParts[3], user_id, pag)
	if err != nil {
		switch err.Error() {
		case "forbidden":
			utils.SendResponses(w, http.StatusForbidden, "Not authorized", nil)
			return
		default:
			utils.SendResponses(w, http.StatusInternalServerError, "Internal Server Error", nil)
			return
		}
	}
	utils.SendResponses(w, http.StatusOK, "Created successfully", groupPost)
}

func (g *GroupHandler) CreateEvent(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		utils.SendResponses(w, http.StatusBadRequest, "Bad request", nil)
		return
	}
	if r.Header.Get("Content-Type") != "application/json" {
		utils.SendResponses(w, http.StatusUnsupportedMediaType, "content-Type must be application/json", nil)
		return
	}

	var event models.Event
	err := json.NewDecoder(r.Body).Decode(&event)
	if err != nil {

		utils.SendResponses(w, http.StatusBadRequest, "invalid JSON data", nil)
		return
	}
	user_id, ok := r.Context().Value("user_id").(string)
	if !ok {
		utils.SendResponses(w, http.StatusBadRequest, "user id Most be String", nil)
	}
	eventCreation, err := g.GroupService.CreateEvent(event, user_id)
	if err != nil {
		switch err.Error() {
		case "forbidden":
			utils.SendResponses(w, http.StatusForbidden, "Not authorized", nil)
		case "title and description are required":
			utils.SendResponses(w, http.StatusBadRequest, err.Error(), nil)
		case "title must be less than 50 characters and description less than 200 characters":
			utils.SendResponses(w, http.StatusBadRequest, err.Error(), nil)
		case "invalid date format, use YYYY-MM-DD":
			utils.SendResponses(w, http.StatusBadRequest, err.Error(), nil)
		case "event date must be in the future":
			utils.SendResponses(w, http.StatusBadRequest, err.Error(), nil)
		default:
			utils.SendResponses(w, http.StatusInternalServerError, "Internal Server Error", nil)
		}
		return
	}

	groupID, _ := uuid.FromString(event.Group_id)
	userID, _ := uuid.FromString(user_id)

	groupMembers, err := g.GroupService.GetGroupMembers(userID, groupID)
	if err != nil {
		utils.SendResponses(w, http.StatusInternalServerError, "Internal Server Error", nil)
		return
	}

	g.WebSocketService.SendNotification(groupMembers, models.Notification{
		Type:       "event",
		GroupID:    groupID,
		GroupTitle: eventCreation.Group_title,
		Label:      fmt.Sprintf(`New event created "%s" in "%s"`, eventCreation.Title, eventCreation.Group_title),
		CreatedAt:  time.Now(),
	})

	utils.SendResponses(w, http.StatusCreated, "Event created successfully", eventCreation)
}

func (g *GroupHandler) Event(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		utils.SendResponses(w, http.StatusBadRequest, "Bad request", nil)
		return
	}
	if r.Header.Get("Content-Type") != "application/json" {
		utils.SendResponses(w, http.StatusUnsupportedMediaType, "content-Type must be application/json", nil)
		return
	}
	pathParts := strings.Split(r.URL.Path, "/")
	if len(pathParts) != 6 {
		utils.SendResponses(w, http.StatusNotFound, "Not Found", nil)
		return
	}
	page, err := strconv.Atoi(pathParts[5])
	if err != nil {
		utils.SendResponses(w, http.StatusBadRequest, "Bad request", nil)
		return
	}
	user_id, ok := r.Context().Value("user_id").(string)
	if !ok {
		utils.SendResponses(w, http.StatusBadRequest, "user id Most be String", nil)
	}
	events, err := g.GroupService.Event(pathParts[3], user_id, page)
	if err != nil {

		utils.SendResponses(w, http.StatusInternalServerError, "Internal Server Error", nil)
		return
	}
	utils.SendResponses(w, http.StatusOK, "Created successfully", events)
}

func (g *GroupHandler) EventResponse(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		utils.SendResponses(w, http.StatusBadRequest, "Bad request", nil)
		return
	}
	if r.Header.Get("Content-Type") != "application/json" {
		utils.SendResponses(w, http.StatusUnsupportedMediaType, "content-Type must be application/json", nil)
		return
	}
	pathParts := strings.Split(r.URL.Path, "/")
	if len(pathParts) != 6 {
		utils.SendResponses(w, http.StatusNotFound, "Not Found", nil)
		return
	}
	var event models.Event
	err := json.NewDecoder(r.Body).Decode(&event)
	if err != nil {

		utils.SendResponses(w, http.StatusBadRequest, "invalid JSON data", nil)
		return
	}
	user_id, ok := r.Context().Value("user_id").(string)
	if !ok {
		utils.SendResponses(w, http.StatusBadRequest, "user id Most be String", nil)
	}
	events, err := g.GroupService.EventResponse(pathParts[3], event.Event_id, user_id, event.Respose)
	if err != nil {
		switch err.Error() {
		case "forbidden":
			utils.SendResponses(w, http.StatusForbidden, "Not authorized", nil)
		case "invalid response, must be 'going' or 'not_going'":
			utils.SendResponses(w, http.StatusBadRequest, err.Error(), nil)
		default:
			utils.SendResponses(w, http.StatusInternalServerError, "Internal Server Error", nil)
		}
		return
	}
	utils.SendResponses(w, http.StatusOK, "Updated successfully", events)
}
