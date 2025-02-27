package services

import (
	"database/sql"
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
	likeID := uuid.Must(uuid.NewV4())
	var react *models.Reacts
	switch target {
	case "Post":
		if !r.PostRepo.PostExist(likeable_id) {
			return fmt.Errorf("post with ID %s does not exist", likeable_id)
		}
		react = &models.Reacts{
			ID:            likeID.String(),
			UserID:        userID,
			Post_id:       sql.NullString{String: likeable_id, Valid: true},
			Comment_id:    sql.NullString{Valid: false},
			Group_Post_id: sql.NullString{Valid: false},
		}
	case "Comment":
		if !r.CommentRepo.CommentExist(likeable_id) {
			return fmt.Errorf("comment with ID %s does not exist", likeable_id)
		}
		react = &models.Reacts{
			ID:            likeID.String(),
			UserID:        userID,
			Post_id:       sql.NullString{Valid: false},
			Group_Post_id: sql.NullString{Valid: false},
			Comment_id:    sql.NullString{String: likeable_id, Valid: true},
		}
	case "Group_Post":
		if !r.GroupRepo.PostGroupExist(likeable_id) {
			return fmt.Errorf("group post with ID %s does not exist", likeable_id)
		}
		react = &models.Reacts{
			ID:            likeID.String(),
			UserID:        userID,
			Comment_id:    sql.NullString{Valid: false},
			Post_id:       sql.NullString{Valid: false},
			Group_Post_id: sql.NullString{String: likeable_id, Valid: true},
		}
	default:
		return fmt.Errorf("invalid target type: %s", target)
	}

	r.ReactRepo.CreateReact(react, target)

	return nil
}
