package services

import (
	"fmt"

	"blank/pkg/app/models"
	"blank/pkg/app/repositories"

	"github.com/gofrs/uuid/v5"
)

type ReactService struct {
	ReactRepo   *repositories.ReactReposetorie
	PostRepo    *repositories.PostRepository
	CommentRepo *repositories.CommentRepositorie
	GroupRepo   *repositories.GroupRepository
}

func (r *ReactService) GetReacts(ID, target string) (any, error) {
	data, err := r.ReactRepo.GetReacts(ID, target)
	if err != nil {
		return nil, err
	}
	return data, nil
}

func (r *ReactService) Create(userID uuid.UUID, likeable_id, target string) error {
	likeID, err := uuid.NewV4()
	if err != nil {
		return fmt.Errorf("failed to generate UUID: %v", err)
	}
	switch target {
	case "Post":
		if !r.PostRepo.PostExist(likeable_id) {
			return fmt.Errorf("post with ID %s does not exist", likeable_id)
		}
	case "Comment":
		if !r.CommentRepo.CommentExist(likeable_id) {
			return fmt.Errorf("comment with ID %s does not exist", likeable_id)
		}
	case "Group_Post":
		if !r.GroupRepo.PostGroupExist(likeable_id) {
			return fmt.Errorf("group post with ID %s does not exist", likeable_id)
		}
	default:
		return fmt.Errorf("invalid target type: %s", target)
	}
	react := &models.Reacts{
		ID:          likeID,
		UserID:      userID,
		Likeable_id: likeable_id,
	}

	r.ReactRepo.CreateReact(react, target)

	return nil
}
