package services

import (
	"blank/pkg/app/models"
	"blank/pkg/app/repositories"
)

type FollowService struct {
	FollowRepo *repositories.FollowRepositorie
}

func (f *FollowService) GetFollowers(userId string, offset int) (*models.FollowListResponse, error) {
    return f.FollowRepo.GetFollowers(userId, offset)
}

func (f *FollowService) GetFollowing(userId string, offset int) (*models.FollowListResponse, error) {
    return f.FollowRepo.GetFollowing(userId, offset)
}
