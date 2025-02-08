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
}

func (r *ReactService) GetReacts(ID, target string) (any, error) {
	data, err := r.ReactRepo.GetReacts(ID, target)
	if err != nil {
		return nil, err
	}
	return data, nil
}

func (r *ReactService) Create(userID uuid.UUID, postID, commentID string, typeOfReact, target string) error {
	likeID, err := uuid.NewV4()
	if err != nil {
		return fmt.Errorf("failed to generate UUID: %v", err)
	}
	var postIDPtr, commentIDPtr *string
	if postID != "" && r.PostRepo.PostExist(postID) {
		postIDPtr = &postID
	}
	if commentID != "" && r.CommentRepo.CommentExist(commentID) {
		commentIDPtr = &commentID
	}
	if postIDPtr == nil && commentIDPtr == nil {
		return fmt.Errorf("post or comment doesn't exist")
	}
	react := &models.Reacts{
		ID:        likeID,
		UserID:    userID,
		PostID:    postIDPtr,
		CommentID: commentIDPtr,
		ReactType: typeOfReact,
	}

	r.ReactRepo.CreateReact(react, target)

	return nil
}
