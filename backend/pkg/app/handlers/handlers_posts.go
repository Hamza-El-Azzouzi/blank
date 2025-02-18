package handlers

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"strings"

	"blank/pkg/app/middleware"
	"blank/pkg/app/models"
	"blank/pkg/app/services"
	"blank/pkg/app/utils"

	"github.com/gofrs/uuid/v5"
)

type PostHandler struct {
	AuthService    *services.AuthService
	AuthMidlaware  *middleware.AuthMiddleware
	PostService    *services.PostService
	CommentService *services.CommentService
	AuthHandler    *AuthHandler
}

func (p *PostHandler) Posts(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		utils.SendResponses(w, http.StatusMethodNotAllowed, "Method Not Allowed", nil)
		return
	}

	userID, err := uuid.FromString(r.Context().Value("user_id").(string))
	if err != nil {
		w.WriteHeader(http.StatusUnauthorized)
		utils.SendResponses(w, http.StatusUnauthorized, "User Not Authorized", nil)
		return
	}

	pathParts := strings.Split(r.URL.Path, "/")
	if len(pathParts) != 4 {
		utils.SendResponses(w, http.StatusNotFound, "Page Not Found", nil)
		return
	}
	pagination := pathParts[3]
	if pagination == "" {
		utils.SendResponses(w, http.StatusNotFound, "Page Not Found", nil)
		return
	}
	nPagination, err := strconv.Atoi(pagination)
	if err != nil {
		utils.SendResponses(w, http.StatusNotFound, "Page Not Found", nil)
		return
	}
	posts, err := p.PostService.AllPosts(nPagination, userID)
	if err != nil {
		utils.SendResponses(w, http.StatusInternalServerError, "Internal Server Error", nil)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	err = json.NewEncoder(w).Encode(posts)
	if err != nil {
		utils.SendResponses(w, http.StatusInternalServerError, "Internal Server Error", nil)
	}
}

func (p *PostHandler) PostsByUser(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		utils.SendResponses(w, http.StatusMethodNotAllowed, "Method Not Allowed", nil)
		return
	}
	pathParts := strings.Split(r.URL.Path, "/")
	if len(pathParts) != 5 {
		utils.SendResponses(w, http.StatusNotFound, "Not Found", nil)
		return
	}
	pagination := pathParts[4]
	if pagination == "" {
		utils.SendResponses(w, http.StatusNotFound, "Not Found", nil)
		return
	}
	nPagination, err := strconv.Atoi(pagination)
	if err != nil {
		utils.SendResponses(w, http.StatusNotFound, "Not Found", nil)
		return
	}

	userID, err := uuid.FromString(r.PathValue("id"))
	if err != nil {
		log.Println(err)
		utils.SendResponses(w, http.StatusBadRequest, "Invalid user ID", nil)
		return
	}

	posts, err := p.PostService.PostsByUser(userID, nPagination)
	if err != nil {
		fmt.Println(err)
		utils.SendResponses(w, http.StatusInternalServerError, "Internal Server Error", nil)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	err = json.NewEncoder(w).Encode(posts)
	if err != nil {
		utils.SendResponses(w, http.StatusInternalServerError, "Internal Server Error", nil)
	}
}

func (p *PostHandler) PostSaver(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		utils.SendResponses(w, http.StatusMethodNotAllowed, "Method Not Allowed", nil)
		return
	}
	var postData models.PostData

	err := json.NewDecoder(r.Body).Decode(&postData)
	if err != nil {
		utils.SendResponses(w, http.StatusBadRequest, "Bad Request", nil)
		return
	}
	defer r.Body.Close()

	if (postData.Content == "" && postData.Image == "") || len(postData.Content) > 5000 {
		utils.SendResponses(w, http.StatusBadRequest, "Bad Request", nil)
		return
	}
	userID, err := uuid.FromString(r.Context().Value("user_id").(string))
	if err != nil {
		utils.SendResponses(w, http.StatusBadRequest, "Invalid authenticated user ID", nil)
		return
	}
	err = p.PostService.PostSave(userID, postData.Content, postData.Privacy, postData.Image, postData.SelectedFollowers)
	if err != nil {
		utils.SendResponses(w, http.StatusBadRequest, "Bad Request", nil)
		return
	}
	posts, err := p.PostService.AllPosts(0, userID)
	if err != nil {
		utils.SendResponses(w, http.StatusInternalServerError, "Internal Server Error", nil)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	err = json.NewEncoder(w).Encode(posts[0])
	if err != nil {
		utils.SendResponses(w, http.StatusInternalServerError, "Internal Server Error", nil)
	}
}

func (p *PostHandler) CommentSaver(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}
	var commentData models.CommentData

	decoder := json.NewDecoder(r.Body)
	err := decoder.Decode(&commentData)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	defer r.Body.Close()
	isLogged, userId := p.AuthMidlaware.IsUserLoggedIn(w, r)
	if !isLogged {
		w.WriteHeader(http.StatusForbidden)
		return
	}
	commentData.Comment = strings.TrimSpace(commentData.Comment)
	if commentData.Comment == "" || len(commentData.Comment) > 5000 {
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	err = p.CommentService.SaveComment(userId.ID, commentData.PostId, commentData.Comment)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	comment, err := p.CommentService.GetCommentByPost(commentData.PostId, 0)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	err = json.NewEncoder(w).Encode(comment[0])
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
	}
}

func (p *PostHandler) CommentGetter(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}
	pathParts := strings.Split(r.URL.Path, "/")
	if len(pathParts) != 5 {
		w.WriteHeader(http.StatusNotFound)
		return
	}
	var err error
	postID := pathParts[3]
	pagination := pathParts[4]
	nPagination, err := strconv.Atoi(pagination)
	if err != nil {
		w.WriteHeader(http.StatusNotFound)
		return
	}
	comment, err := p.CommentService.GetCommentByPost(postID, nPagination)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	err = json.NewEncoder(w).Encode(comment)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
	}
}
