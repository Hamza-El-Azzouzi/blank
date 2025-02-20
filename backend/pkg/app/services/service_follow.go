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

func (f *FollowService) DeleteFollowing(followData models.FollowRequest) (int, string) {
	if !f.FollowRepo.IsUserExists(followData.FollowingId) {
		return 404, "following user not found"
	}

	return f.FollowRepo.DeleteFollowing(followData)
}

func (f *FollowService) DeleteFollower(followData models.FollowRequest) (int, string) {
    if !f.FollowRepo.IsUserExists(followData.FollowerId) {
        return 404, "follower user not found"
    }

    return f.FollowRepo.DeleteFollower(followData)
}