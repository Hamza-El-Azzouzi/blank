package services

import (
	"fmt"
	"strings"

	"blank/pkg/app/models"
	"blank/pkg/app/repositories"
	"blank/pkg/app/utils"

	"github.com/gofrs/uuid/v5"
)

type PostService struct {
	PostRepo *repositories.PostRepository
	UserRepo *repositories.UserRepository
}

func (p *PostService) PostSave(userId uuid.UUID, content string, privacy string, image string, selectedFollowers []string) error {
	postId := uuid.Must(uuid.NewV4())
	privacy = strings.ToLower(privacy)
	imageFilename, err := utils.SaveImage(image)
	if err != nil {
		return err
	}

	post := &models.Post{
		ID:      postId,
		UserID:  userId,
		Content: content,
		Image:   imageFilename,
		Privacy: privacy,
	}

	err = p.PostRepo.Create(post)
	if err != nil {
		return err
	}

	if len(selectedFollowers) > 0 {
		for _, follower := range selectedFollowers {
			err = p.PostRepo.PostPrivacy(postId, follower)
			if err != nil {
				return err
			}
		}
	}
	return nil
}

func (p *PostService) AllPosts(pagination int, currentUserID uuid.UUID) ([]models.PostWithUser, error) {
	posts, err := p.PostRepo.AllPosts(pagination, currentUserID)
	if err != nil {
		return nil, fmt.Errorf("error Kayn f All Post service : %v", err)
	}
	return posts, nil
}

func (p *PostService) PostsByUser(userID, authUserID uuid.UUID, pagination int) ([]models.PostByUser, error) {
	posts, err := p.PostRepo.PostsByUser(userID, authUserID, pagination)
	if err != nil {
		return nil, fmt.Errorf("error Kayn f Posts by user service : %v", err)
	}
	return posts, nil
}

func (p *PostService) PostExist(postID string) bool {
	return p.PostRepo.PostExist(postID)
}
