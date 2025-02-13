package services

import (
	"fmt"

	"blank/pkg/app/models"
	"blank/pkg/app/repositories"

	"github.com/gofrs/uuid/v5"
)

type PostService struct {
	PostRepo     *repositories.PostRepository
}

func (p *PostService) PostSave(userId uuid.UUID, content string) error {
	postId := uuid.Must(uuid.NewV4())

	post := &models.Post{
		ID:      postId,
		UserID:  userId,
		Content: content,
	}

	return p.PostRepo.Create(post)
}

func (p *PostService) AllPosts(pagination int) ([]models.PostWithUser, error) {
	posts, err := p.PostRepo.AllPosts(pagination)
	if err != nil {
		return nil, fmt.Errorf("error Kayn f All Post service : %v", err)
	}
	return posts, nil
}
