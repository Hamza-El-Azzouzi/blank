package services

import (
	"database/sql"

	"blank/pkg/app/models"
	"blank/pkg/app/repositories"
)

type FollowService struct {
	FollowRepo *repositories.FollowRepositorie
	UserRepo   *repositories.UserRepository
}

func (f *FollowService) RequestFollow(follow models.FollowRequest) error {
	if f.UserRepo.IsProfilePublic(follow.FollowingId) {
		return f.FollowRepo.CreateFollow(follow)
	}
	return f.FollowRepo.RequestFollow(follow)
}

func (f *FollowService) AcceptFollow(follow models.FollowRequest) error {
	return f.FollowRepo.AcceptFollow(follow)
}

func (f *FollowService) RefuseFollow(follow models.FollowRequest) error {
	return f.FollowRepo.RefuseFollow(follow)
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
