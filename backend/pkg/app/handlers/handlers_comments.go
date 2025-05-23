package handlers

import (
	"encoding/json"
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
const NotFound = "Page Not Found"
const NotFoundComment = "Invalid comment ID"
const NotFoundPost = "Invalid post ID"
const UserNotFound = "Invalid authenticated user ID"
const InternalServerError = "Internal Server Error"

func (c *CommentHandler) CommentsGetter(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		utils.SendResponses(w, http.StatusMethodNotAllowed, "Method Not Allowed", nil)
		return
	}
	pathParts := strings.Split(r.URL.Path, "/")
	if len(pathParts) != 6 {
		utils.SendResponses(w, http.StatusNotFound, NotFound, nil)
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
		utils.SendResponses(w, http.StatusNotFound, NotFound, nil)
		return
	}
	page, err = strconv.Atoi(strPage)
	if err != nil {
		utils.SendResponses(w, http.StatusNotFound, NotFound, nil)
		return
	}
	postID = r.PathValue("post_id")
	target := pathParts[5]
	_, err = uuid.FromString(postID)
	if err != nil {
		utils.SendResponses(w, http.StatusBadRequest, NotFoundPost, nil)
		return
	}

	postExist = c.PostService.PostExist(postID)
	if !postExist && target == "Post" {
		utils.SendResponses(w, http.StatusBadRequest, NotFoundPost, nil)
		return
	}

	userID, err := uuid.FromString(r.Context().Value("user_id").(string))
	if err != nil {
		utils.SendResponses(w, http.StatusBadRequest, UserNotFound, nil)
		return
	}

	comments, err = c.CommentService.CommentsByPost(userID, postID, target, page)
	if err != nil {
		utils.SendResponses(w, http.StatusInternalServerError, InternalServerError, nil)
		return
	}

	utils.SendResponses(w, http.StatusOK, "", comments)
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

	postExist := c.PostService.PostExist(commentData.Commentable_id)
	if !postExist && commentData.Target == "Post" {
		utils.SendResponses(w, http.StatusBadRequest,NotFoundPost, nil)
		return
	}

	commentData.Content = strings.TrimSpace(commentData.Content)
	if (commentData.Content == "" && commentData.Image == "") || len(commentData.Content) > 200 {
		utils.SendResponses(w, http.StatusBadRequest, "Comment can't be empty or longer than  200 characters", nil)
		return
	}

	userID, err := uuid.FromString(r.Context().Value("user_id").(string))
	if err != nil {
		utils.SendResponses(w, http.StatusBadRequest, UserNotFound, nil)
		return
	}

	insertedID, err := c.CommentService.SaveComment(userID, commentData.Commentable_id, commentData.Content, commentData.Target, commentData.Image)
	if err != nil {
		utils.SendResponses(w, http.StatusInternalServerError, InternalServerError, nil)
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
		utils.SendResponses(w, http.StatusBadRequest, NotFoundComment, nil)
		return
	}

	commentExist := c.CommentService.CommentExist(commentID)
	if !commentExist {
		utils.SendResponses(w, http.StatusBadRequest, NotFoundComment, nil)
		return
	}
	pathParts := strings.Split(r.URL.Path, "/")
	if len(pathParts) != 6 {
		utils.SendResponses(w, http.StatusNotFound, NotFound, nil)
		return
	}
	userID, err = uuid.FromString(r.Context().Value("user_id").(string))
	if err != nil {
		utils.SendResponses(w, http.StatusBadRequest, UserNotFound, nil)
		return
	}
	err = c.CommentService.LikeComment(userID, commentID)
	if err != nil {
		utils.SendResponses(w, http.StatusInternalServerError, InternalServerError, nil)
		return
	}

	utils.SendResponses(w, http.StatusOK, "success", nil)
}
