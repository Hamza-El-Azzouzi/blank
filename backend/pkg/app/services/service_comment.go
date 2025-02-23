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

func (c *CommentService) CommentsByPost(userID uuid.UUID, postID string, page int) ([]models.CommentDetails, error) {
	limit := 20
	offset := page * limit
	return c.CommentRepo.GetCommentByPost(userID, postID, offset, limit)
}

func (c *CommentService) SaveComment(userID uuid.UUID, postID, content string) (uuid.UUID, error) {
	comment := &models.Comment{
		ID:      uuid.Must(uuid.NewV4()),
		UserID:  userID,
		PostID:  postID,
		Content: content,
	}
	return comment.ID, c.CommentRepo.Create(comment)
}

func (c *CommentService) LikeComment(userID uuid.UUID, commentID string) error {
	likeID, err := c.CommentRepo.CheckLike(userID, commentID)
	if err != nil {
		if err == sql.ErrNoRows {
			likeID, err := uuid.NewV4()
			if err != nil {
				return err
			}
			return c.CommentRepo.LikeComment(likeID, userID, commentID)
		}
		return err
	}
	return c.CommentRepo.RemoveLike(likeID)
}

func (c *CommentService) CommentExist(commentID string) bool {
	return c.CommentRepo.CommentExist(commentID)
}
