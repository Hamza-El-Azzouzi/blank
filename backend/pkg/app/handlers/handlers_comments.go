package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"strconv"
	"strings"

	"blank/pkg/app/models"
	"blank/pkg/app/services"
	"blank/pkg/app/utils"

	"github.com/gofrs/uuid/v5"
)

type CommentHandler struct {
	CommentService *services.CommentService
	PostService    *services.PostService
	UserHandler    *services.UserService
}

func (c *CommentHandler) CommentsGetter(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		utils.SendResponses(w, http.StatusMethodNotAllowed, "Method Not Allowed", nil)
		return
	}
	pathParts := strings.Split(r.URL.Path, "/")
	if len(pathParts) != 5 {
		utils.SendResponses(w, http.StatusNotFound, "Page Not Found", nil)
		return
	}
	var (
		comments  []models.CommentDetails
		postID    string
		page      int
		postExist bool
		err       error
	)
	pagination := pathParts[4]
	if pagination == "" {
		utils.SendResponses(w, http.StatusNotFound, "Page Not Found", nil)
		return
	}
	page, err = strconv.Atoi(pagination)
	if err != nil {
		utils.SendResponses(w, http.StatusNotFound, "Page Not Found", nil)
		return
	}
	postID = r.PathValue("post_id")
	_, err = uuid.FromString(postID)
	if err != nil {
		utils.SendResponses(w, http.StatusBadRequest, "Invalid post ID", nil)
		return
	}
	
	postExist = c.PostService.PostExist(postID)
	if !postExist {
		utils.SendResponses(w, http.StatusBadRequest, "Invalid post ID", nil)
	}
	
	comments, err = c.CommentService.CommentsByPost(postID, page)
	if err != nil {
		log.Println(err)
		utils.SendResponses(w, http.StatusInternalServerError, "Internal Server Error", nil)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	err = json.NewEncoder(w).Encode(comments)
	if err != nil {
		utils.SendResponses(w, http.StatusInternalServerError, "Internal Server Error", nil)
	}
}
