package services

import (
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