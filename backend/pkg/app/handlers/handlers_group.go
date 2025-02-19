package handlers

import (
	"encoding/json"
	"net/http"
	"strings"

	"blank/pkg/app/models"
	"blank/pkg/app/services"
	"blank/pkg/app/utils"
)

type GroupHandler struct {
	GroupService *services.GroupService
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
	user_id := r.Context().Value("user_id")
	groupCreation, err := g.GroupService.CreateGroup(group, user_id)
	if err != nil {

		utils.SendResponses(w, http.StatusInternalServerError, "Internal Server Error", nil)
		return
	}
	utils.SendResponses(w, http.StatusOK, "Created successfully", groupCreation)
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
	user_id := r.Context().Value("user_id").(string)
	groups, err := g.GroupService.Groups(user_id)
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
	user_id := r.Context().Value("user_id").(string)
	term := r.URL.Query().Get("q")
	groups, err := g.GroupService.GroupsSearch(user_id, term)
	if err != nil {

		utils.SendResponses(w, http.StatusInternalServerError, "Internal Server Error", nil)
		return
	}
	utils.SendResponses(w, http.StatusOK, "Created successfully", groups)
}

func (g *GroupHandler) GroupDerails(w http.ResponseWriter, r *http.Request) {
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
	user_id := r.Context().Value("user_id").(string)
	GroupDerails, err := g.GroupService.GroupDerails(user_id, pathParts[3])
	if err != nil {

		utils.SendResponses(w, http.StatusInternalServerError, "Internal Server Error", nil)
		return
	}

	utils.SendResponses(w, http.StatusOK, "Created successfully", GroupDerails)
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
	user_id := r.Context().Value("user_id").(string)
	err := g.GroupService.JoinGroup(pathParts[3], user_id, pathParts[4])
	if err != nil {

		utils.SendResponses(w, http.StatusInternalServerError, "Internal Server Error", nil)
		return
	}
	utils.SendResponses(w, http.StatusOK, "Created successfully", nil)
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
	err := g.GroupService.GroupDelete(pathParts[3])
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
	if len(pathParts) != 5 {
		utils.SendResponses(w, http.StatusNotFound, "Not Found", nil)
		return
	}
	groupRequest, err := g.GroupService.GroupRequest(pathParts[3])
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
	memberCount, err := g.GroupService.GroupResponse(pathParts[3], groupResponse)
	if err != nil {

		utils.SendResponses(w, http.StatusInternalServerError, "Internal Server Error", nil)
		return
	}
	utils.SendResponses(w, http.StatusOK, "Created successfully", memberCount)
}

func (g *GroupHandler) GroupeLeave(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		utils.SendResponses(w, http.StatusBadRequest, "Bad request", nil)
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
	user_id := r.Context().Value("user_id").(string)
	_, err := g.GroupService.GroupLeave(pathParts[3], user_id)
	if err != nil {
		utils.SendResponses(w, http.StatusInternalServerError, "Internal Server Error", nil)
		return
	}
	utils.SendResponses(w, http.StatusOK, "Created successfully", nil)
}
