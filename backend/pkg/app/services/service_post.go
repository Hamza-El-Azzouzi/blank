package services

import (
	"fmt"

	"blank/pkg/app/models"
	"blank/pkg/app/repositories"

	"github.com/gofrs/uuid/v5"
)

type PostService struct {
	PostRepo     *repositories.PostRepository
	CategoryRepo *repositories.CategoryRepository
}

func (p *PostService) PostSave(userId uuid.UUID, title, content string, category []string) error {
	postId := uuid.Must(uuid.NewV4())

	post := &models.Post{
		ID:      postId,
		UserID:  userId,
		Title:   title,
		Content: content,
	}
	for _, id := range category {
		if p.CategoryRepo.CheckCategorie(id) {
			postCategory := &models.PostCategory{
				PostID:     postId,
				CategoryID: id,
			}

			err := p.PostRepo.PostCatgorie(postCategory)
			if err != nil {
				return fmt.Errorf("error F categorie : %v ", err)
			}
		} else {
			return fmt.Errorf("categorie not found")
		}
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

func (p *PostService) PostsByUser(userID uuid.UUID, pagination int) ([]models.PostByUser, error) {
	posts, err := p.PostRepo.PostsByUser(userID, pagination)
	if err != nil {
		return nil, fmt.Errorf("error Kayn f Posts by user service : %v", err)
	}
	return posts, nil
}
