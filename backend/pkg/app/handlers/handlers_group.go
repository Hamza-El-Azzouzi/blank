package handlers

import (
	"encoding/json"
	"fmt"
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
	}
	if r.Header.Get("Content-Type") != "application/json" {
		utils.SendResponses(w, http.StatusUnsupportedMediaType, "content-Type must be application/json", nil)
		return
	}

	var group models.Group
	err := json.NewDecoder(r.Body).Decode(&group)
	fmt.Println(err)
	if err != nil {

		utils.SendResponses(w, http.StatusBadRequest, "invalid JSON data", nil)
		return
	}
	user_id := r.Context().Value("user_id")
	fmt.Println(group)
	groupCreation, err := g.GroupService.CreateGroup(group, user_id)
	if err != nil {
		fmt.Println(err)
		utils.SendResponses(w, http.StatusInternalServerError, "Internal Server Error", nil)
		return
	}
	fmt.Println("hhhhhh")
	utils.SendResponses(w, http.StatusOK, "Created successfully", groupCreation)
}

func (g *GroupHandler) Groups(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		utils.SendResponses(w, http.StatusBadRequest, "Bad request", nil)
	}
	if r.Header.Get("Content-Type") != "application/json" {
		utils.SendResponses(w, http.StatusUnsupportedMediaType, "content-Type must be application/json", nil)
		return
	}
	user_id := r.Context().Value("user_id").(string)
	groups, err := g.GroupService.Groups(user_id)
	if err != nil {
		fmt.Println(err)
		utils.SendResponses(w, http.StatusInternalServerError, "Internal Server Error", nil)
		return
	}
	fmt.Println(groups)
	utils.SendResponses(w, http.StatusOK, "Created successfully", groups)
}

func (g *GroupHandler) GroupDerails(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		utils.SendResponses(w, http.StatusBadRequest, "Bad request", nil)
	}
	if r.Header.Get("Content-Type") != "application/json" {
		utils.SendResponses(w, http.StatusUnsupportedMediaType, "content-Type must be application/json", nil)
		return
	}

	pathParts := strings.Split(r.URL.Path, "/")
	fmt.Println(pathParts)
	if len(pathParts) != 4 {
		utils.SendResponses(w, http.StatusNotFound, "Not Found", nil)
		return
	}
	user_id := r.Context().Value("user_id").(string)
	GroupDerails, err := g.GroupService.GroupDerails(user_id,pathParts[3])
	if err != nil {
		fmt.Println(err)
		utils.SendResponses(w, http.StatusInternalServerError, "Internal Server Error", nil)
		return
	}
	fmt.Println(GroupDerails)
	utils.SendResponses(w, http.StatusOK, "Created successfully", GroupDerails)
}

func (g *GroupHandler) JoinGroup(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		utils.SendResponses(w, http.StatusBadRequest, "Bad request", nil)
	}
	if r.Header.Get("Content-Type") != "application/json" {
		utils.SendResponses(w, http.StatusUnsupportedMediaType, "content-Type must be application/json", nil)
		return
	}

	pathParts := strings.Split(r.URL.Path, "/")
	fmt.Println(pathParts)
	if len(pathParts) != 5 {
		utils.SendResponses(w, http.StatusNotFound, "Not Found", nil)
		return
	}
	if pathParts[4] != "invited" && pathParts[4] != "requested" {
		utils.SendResponses(w, http.StatusNotFound, "Not Found", nil)
		return
	}
	user_id := r.Context().Value("user_id").(string)
	err := g.GroupService.JoinGroup(pathParts[3],user_id,pathParts[4])
	if err != nil {
		fmt.Println(err)
		utils.SendResponses(w, http.StatusInternalServerError, "Internal Server Error", nil)
		return
	}
	utils.SendResponses(w, http.StatusOK, "Created successfully", nil)
}
func (g *GroupHandler) GroupDelete(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodDelete {
		utils.SendResponses(w, http.StatusBadRequest, "Bad request", nil)
	}
	if r.Header.Get("Content-Type") != "application/json" {
		utils.SendResponses(w, http.StatusUnsupportedMediaType, "content-Type must be application/json", nil)
		return
	}

	pathParts := strings.Split(r.URL.Path, "/")
	fmt.Println(pathParts)
	if len(pathParts) != 5 {
		utils.SendResponses(w, http.StatusNotFound, "Not Found", nil)
		return
	}
	err := g.GroupService.GroupDelete(pathParts[3])
	if err != nil {
		fmt.Println(err)
		utils.SendResponses(w, http.StatusInternalServerError, "Internal Server Error", nil)
		return
	}
	utils.SendResponses(w, http.StatusOK, "Created successfully", nil)
}
// GroupRequest

func (g *GroupHandler) GroupRequest(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		utils.SendResponses(w, http.StatusBadRequest, "Bad request", nil)
	}
	if r.Header.Get("Content-Type") != "application/json" {
		utils.SendResponses(w, http.StatusUnsupportedMediaType, "content-Type must be application/json", nil)
		return
	}

	pathParts := strings.Split(r.URL.Path, "/")
	fmt.Println(pathParts)
	if len(pathParts) != 5 {
		utils.SendResponses(w, http.StatusNotFound, "Not Found", nil)
		return
	}
	err := g.GroupService.GroupDelete(pathParts[3])
	if err != nil {
		fmt.Println(err)
		utils.SendResponses(w, http.StatusInternalServerError, "Internal Server Error", nil)
		return
	}
	utils.SendResponses(w, http.StatusOK, "Created successfully", nil)
}