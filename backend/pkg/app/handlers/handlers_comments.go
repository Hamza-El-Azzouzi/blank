package handlers

import (
	"encoding/json"
	"html"
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
	UserService    *services.UserService
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

	userID, err := uuid.FromString(r.Context().Value("user_id").(string))
	if err != nil {
		utils.SendResponses(w, http.StatusBadRequest, "Invalid authenticated user ID", nil)
		return
	}

	comments, err = c.CommentService.CommentsByPost(userID, postID, page)
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

func (c *CommentHandler) CommentSaver(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		utils.SendResponses(w, http.StatusMethodNotAllowed, "Method Not Allowed "+r.Method, nil)
		return
	}
	var commentData models.CommentData

	decoder := json.NewDecoder(r.Body)
	err := decoder.Decode(&commentData)
	if err != nil {
		utils.SendResponses(w, http.StatusBadRequest, "Bad Request", nil)
		return
	}
	defer r.Body.Close()

	postExist := c.PostService.PostExist(commentData.PostID)
	if !postExist {
		utils.SendResponses(w, http.StatusBadRequest, "Invalid post ID", nil)
		return
	}

	commentData.Content = html.EscapeString(strings.TrimSpace(commentData.Content))
	if commentData.Content == "" || len(commentData.Content) > 200 {
		utils.SendResponses(w, http.StatusBadRequest, "Comment can't be empty or longer than  200 characters", nil)
		return
	}

	userID, err := uuid.FromString(r.Context().Value("user_id").(string))
	if err != nil {
		utils.SendResponses(w, http.StatusBadRequest, "Invalid authenticated user ID", nil)
		return
	}

	insertedID, err := c.CommentService.SaveComment(userID, commentData.PostID, commentData.Content)
	if err != nil {
		utils.SendResponses(w, http.StatusInternalServerError, "Internal Server Error", nil)
		return
	}

	utils.SendResponses(w, http.StatusOK, "success", insertedID)
}

func (c *CommentHandler) CommentLiker(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		utils.SendResponses(w, http.StatusMethodNotAllowed, "Method Not Allowed "+r.Method, nil)
		return
	}

	var (
		userID    uuid.UUID
		commentID string
		err       error
	)

	commentID = r.PathValue("comment_id")
	_, err = uuid.FromString(commentID)
	if err != nil {
		utils.SendResponses(w, http.StatusBadRequest, "Invalid comment ID", nil)
		return
	}

	commentExist := c.CommentService.CommentExist(commentID)
	if !commentExist {
		utils.SendResponses(w, http.StatusBadRequest, "Invalid comment ID", nil)
		return
	}

	userID, err = uuid.FromString(r.Context().Value("user_id").(string))
	if err != nil {
		utils.SendResponses(w, http.StatusBadRequest, "Invalid authenticated user ID", nil)
		return
	}

	err = c.CommentService.LikeComment(userID, commentID)
	if err != nil {
		log.Println(err)
		utils.SendResponses(w, http.StatusInternalServerError, "Internal Server Error", nil)
		return
	}

	utils.SendResponses(w, http.StatusOK, "success", nil)
}
