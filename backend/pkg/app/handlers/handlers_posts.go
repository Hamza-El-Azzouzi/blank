package handlers

import (
	"encoding/json"
	"fmt"
	"mime"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"

	"blank/pkg/app/middleware"
	"blank/pkg/app/models"
	"blank/pkg/app/services"

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
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}
	pathParts := strings.Split(r.URL.Path, "/")
	if len(pathParts) != 4 {
		w.WriteHeader(http.StatusNotFound)
		return
	}
	pagination := pathParts[3]
	if pagination == "" {
		w.WriteHeader(http.StatusNotFound)
		return
	}
	nPagination, err := strconv.Atoi(pagination)
	if err != nil {
		w.WriteHeader(http.StatusNotFound)
		return
	}
	posts, err := p.PostService.AllPosts(nPagination)
	if err != nil {
		fmt.Println(err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	err = json.NewEncoder(w).Encode(posts)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
	}
}

func (p *PostHandler) PostSaver(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}
	var postData models.PostData

	err := json.NewDecoder(r.Body).Decode(&postData)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	defer r.Body.Close()

	if postData.Content == "" || len(postData.Content) > 5000 {
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	// isLogged, usermid := p.AuthMidlaware.IsUserLoggedIn(w, r)
	// if !isLogged {
	// 	w.WriteHeader(http.StatusForbidden)
	// 	return
	// }
	userID := uuid.Must(uuid.FromString("fdc16121-2efa-49d7-b7e4-b29b7fd7dc17"))
	err = p.PostService.PostSave(userID, postData.Content, postData.Privacy, postData.Image, postData.SelectedFollowers)
	if err != nil {
		fmt.Println(err)
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	posts, err := p.PostService.AllPosts(0)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	err = json.NewEncoder(w).Encode(posts[0])
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
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

func (p *PostHandler) ServeAvatars(w http.ResponseWriter, r *http.Request) {
	avatar := r.PathValue("avatar")
	if avatar == "" {
		http.NotFound(w, r)
		return
	}

	filePath := "./storage/avatars/" + avatar
	file, err := os.Open(filePath)
	if err != nil {
		http.NotFound(w, r)
		return
	}
	defer file.Close()

	contentType := mime.TypeByExtension(filepath.Ext(filePath))
	if contentType == "" {
		contentType = "application/octet-stream"
	}
	w.Header().Set("Content-Type", contentType)

	http.ServeFile(w, r, filePath)
}
