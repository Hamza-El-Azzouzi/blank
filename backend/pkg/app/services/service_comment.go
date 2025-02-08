package services

import (
	"fmt"

	"blank/pkg/app/models"
	"blank/pkg/app/repositories"

	"github.com/gofrs/uuid/v5"
)

type CommentService struct {
	CommentRepo *repositories.CommentRepositorie
	PostRepo    *repositories.PostRepository
}

func (c *CommentService) SaveComment(userID uuid.UUID, postID, content string) error {
	if !c.PostRepo.PostExist(postID) {
		return fmt.Errorf("post does not exist")
	}
	comment := &models.Comment{
		ID:      uuid.Must(uuid.NewV4()),
		UserID:  userID,
		PostID:  postID,
		Content: content,
	}
	return c.CommentRepo.Create(comment)
}

func (c *CommentService) GetCommentByPost(postID string, pagination int) ([]models.CommentDetails, error) {
	comment, err := c.CommentRepo.GetCommentByPost(postID, pagination)
	if err != nil {
		return nil, err
	}
	return comment, nil
}
