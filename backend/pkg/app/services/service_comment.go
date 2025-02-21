package services

import (
	"blank/pkg/app/models"
	"blank/pkg/app/repositories"

	"github.com/gofrs/uuid/v5"
)

type CommentService struct {
	CommentRepo *repositories.CommentRepositorie
	PostRepo    *repositories.PostRepository
}

func (c *CommentService) CommentsByPost(postID string, page int) ([]models.CommentDetails, error) {
	limit := 20
	offset := page * limit
	return c.CommentRepo.GetCommentByPost(postID, offset, limit)
}

func (c *CommentService) SaveComment(userID uuid.UUID, postID, content string) error {
	comment := &models.Comment{
		ID:      uuid.Must(uuid.NewV4()),
		UserID:  userID,
		PostID:  postID,
		Content: content,
	}
	return c.CommentRepo.Create(comment)
}
