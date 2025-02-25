package services

import (
	"database/sql"

	"blank/pkg/app/models"
	"blank/pkg/app/repositories"
	"blank/pkg/app/utils"

	"github.com/gofrs/uuid/v5"
)

type CommentService struct {
	CommentRepo *repositories.CommentRepositorie
	PostRepo    *repositories.PostRepository
}

func (c *CommentService) CommentsByPost(userID uuid.UUID, postID, target string, page int) ([]models.CommentDetails, error) {
	limit := 20
	offset := page * limit
	return c.CommentRepo.GetCommentByPost(userID, postID, target, offset, limit)
}

func (c *CommentService) SaveComment(userID uuid.UUID, commentable_id, content, target, image string) (uuid.UUID, error) {
	var postID sql.NullString
	var groupPostID sql.NullString

	if target == "Post" {
		postID = sql.NullString{String: commentable_id, Valid: true}
		groupPostID = sql.NullString{Valid: false}
	} else if target == "Group_Post" {
		groupPostID = sql.NullString{String: commentable_id, Valid: true}
		postID = sql.NullString{Valid: false}
	}

	imageFilename, err := utils.SaveImage(image)
	if err != nil {
		return uuid.Nil,err
	}
	comment := &models.Comment{
		ID:          uuid.Must(uuid.NewV4()),
		UserID:      userID,
		PostID:      postID,
		GroupPostID: groupPostID,
		Content:     content,
		Image:       imageFilename,
	}
	return comment.ID, c.CommentRepo.Create(comment)
}

func (c *CommentService) LikeComment(userID uuid.UUID, commentID string) error {
	likeID, err := c.CommentRepo.CheckLike(userID, commentID)
	if err != nil {
		if err == sql.ErrNoRows {
			likeID := uuid.Must(uuid.NewV4())
			return c.CommentRepo.LikeComment(likeID, userID, commentID)
		}
		return err
	}
	return c.CommentRepo.RemoveLike(likeID)
}

func (c *CommentService) CommentExist(commentID string) bool {
	return c.CommentRepo.CommentExist(commentID)
}
