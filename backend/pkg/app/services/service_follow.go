package services

import (
	"database/sql"
	"fmt"

	"blank/pkg/app/models"
	"blank/pkg/app/repositories"

	"github.com/gofrs/uuid/v5"
)

type FollowService struct {
	FollowRepo *repositories.FollowRepositorie
	UserRepo   *repositories.UserRepository
}

func (f *FollowService) RequestFollow(follow models.FollowRequest) (string, error) {
	if f.UserRepo.IsProfilePublic(follow.FollowingId) {
		return "public", f.FollowRepo.CreateFollow(follow)
	}
	return "private", f.FollowRepo.RequestFollow(follow)
}

func (f *FollowService) AcceptFollow(followingID, followerID uuid.UUID) error {
	pending, err := f.UserRepo.CheckFollowRequestPending(followingID, followerID)
	if err != nil {
		return err
	}
	if !pending {
		return fmt.Errorf("the follow request is not pending")
	}
	return f.FollowRepo.AcceptFollow(models.FollowRequest{
		FollowerId:  followerID.String(),
		FollowingId: followingID.String(),
	})
}

func (f *FollowService) RefuseFollow(followingID, followerID uuid.UUID) error {
	pending, err := f.UserRepo.CheckFollowRequestPending(followingID, followerID)
	if err != nil {
		return err
	}
	if !pending {
		return fmt.Errorf("the follow request is not pending")
	}
	return f.FollowRepo.RefuseFollow(models.FollowRequest{
		FollowerId:  followerID.String(),
		FollowingId: followingID.String(),
	})
}

func (f *FollowService) GetFollowStatus(follow models.FollowRequest) (string, error) {
	status, err := f.FollowRepo.GetFollowStatus(follow)
	if status == "accepted" {
		status = "Following"
	} else if status == "pending" {
		status = "Pending"
	}
	if err == sql.ErrNoRows {
		return "Follow", nil
	}
	return status, err
}

func (f *FollowService) GetFollowers(userId, offset string) (*models.FollowListResponse, error) {
	followers, err := f.FollowRepo.GetFollowers(userId, offset)
	if err != nil {
		return nil, err
	}
	var response models.FollowListResponse
	response.FollowList = followers
	if len(followers) > 20 {
		response.LastUserId = followers[19].UserId
		response.FollowList = followers[:20]
	}

	return &response, nil
}

func (f *FollowService) GetFollowing(userId, offset string) (*models.FollowListResponse, error) {
	following, err := f.FollowRepo.GetFollowing(userId, offset)
	if err != nil {
		return nil, err
	}
	var response models.FollowListResponse
	response.FollowList = following
	if len(following) > 20 {
		response.LastUserId = following[19].UserId
		response.FollowList = following[:20]
	}

	return &response, nil
}

func (f *FollowService) DeleteFollow(followData models.FollowRequest) error {
	return f.FollowRepo.DeleteFollow(followData)
}

func (f *FollowService) SearchFollowers(userID, offset, query string) (*models.FollowListResponse, error) {
	if query == "" {
		return &models.FollowListResponse{}, nil
	}
	followers, err := f.FollowRepo.SearchFollowers(userID, offset, query)
	if err != nil {
		return nil, err
	}
	var response models.FollowListResponse
	response.FollowList = followers
	if len(followers) > 20 {
		response.LastUserId = followers[19].UserId
		response.FollowList = followers[:20]
	}

	return &response, nil
}

func (f *FollowService) SearchFollowing(userID, offset, query string) (*models.FollowListResponse, error) {
	if query == "" {
		return &models.FollowListResponse{}, nil
	}
	followers, err := f.FollowRepo.SearchFollowing(userID, offset, query)
	if err != nil {
		return nil, err
	}
	var response models.FollowListResponse
	response.FollowList = followers
	if len(followers) > 20 {
		response.LastUserId = followers[19].UserId
		response.FollowList = followers[:20]
	}

	return &response, nil
}
