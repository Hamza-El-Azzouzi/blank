package services

import (
	"database/sql"

	"blank/pkg/app/models"
	"blank/pkg/app/repositories"

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

func (c *CommentService) SaveComment(userID uuid.UUID, commentable_id, content, target string) (uuid.UUID, error) {
	comment := &models.Comment{
		ID:             uuid.Must(uuid.NewV4()),
		UserID:         userID,
		Commentable_id: commentable_id,
		Content:        content,
		Target:         target,
	}
	return comment.ID, c.CommentRepo.Create(comment)
}

func (c *CommentService) LikeComment(userID uuid.UUID, commentID,target string) error {
	likeID, err := c.CommentRepo.CheckLike(userID, commentID,target)
	if err != nil {
		if err == sql.ErrNoRows {
			likeID, err := uuid.NewV4()
			if err != nil {
				return err
			}
			return c.CommentRepo.LikeComment(likeID, userID, commentID,target)
		}
		return err
	}
	return c.CommentRepo.RemoveLike(likeID)
}

func (c *CommentService) CommentExist(commentID string) bool {
	return c.CommentRepo.CommentExist(commentID)
}
