package services

import (
	"fmt"

	"blank/pkg/app/models"
	"blank/pkg/app/repositories"
	"blank/pkg/app/utils"

	"github.com/gofrs/uuid/v5"
)

type GroupService struct {
	GroupRepo *repositories.GroupRepository
}

func (g *GroupService) CreateGroup(data models.Group, user_id any) (models.GroupDetails, error) {
	group_id := uuid.Must(uuid.NewV4()).String()
	return g.GroupRepo.CreateGroup(data, user_id, group_id)
}

func (g *GroupService) Groups(user_id string) ([]models.GroupDetails, error) {
	groups, err := g.GroupRepo.Groups(user_id)
	if err != nil {
		return []models.GroupDetails{}, err
	}
	for i := 0; i < len(groups); i++ {
		if groups[i].UserId == user_id {
			groups[i].IsOwner = true
		} else {
			groups[i].IsOwner = false
			groups[i].IsJoined = g.IsGroupMember(groups[i].GroupeId, user_id)
		}
	}

	return groups, nil
}

func (g *GroupService) GroupsSearch(user_id, term string) ([]models.GroupDetails, error) {
	groups, err := g.GroupRepo.GroupsSearch(user_id, term)
	if err != nil {
		return []models.GroupDetails{}, err
	}
	for i := 0; i < len(groups); i++ {
		if groups[i].UserId == user_id {
			groups[i].IsOwner = true
		} else {
			groups[i].IsOwner = false
			groups[i].IsJoined = g.IsGroupMember(groups[i].GroupeId, user_id)
		}
	}

	return groups, nil
}

func (g *GroupService) GroupDetails(user_id, group_id string) (models.GroupDetails, error) {
	groupDetails, err := g.GroupRepo.GroupDerails(user_id, group_id)
	if err != nil {
		return models.GroupDetails{}, err
	}
	if groupDetails.UserId == user_id {
		groupDetails.IsOwner = true
	} else {
		groupDetails.IsOwner = false
	}
	groupDetails.IsJoined = g.IsGroupMember(group_id, user_id)
	return groupDetails, nil
}

func (g *GroupService) IsGroupMember(group_id, user_id string) bool {
	groupDetails, err := g.GroupRepo.IsGroupMember(group_id, user_id)
	if err != nil {
		return groupDetails
	}
	return groupDetails
}

func (g *GroupService) IsOwner(group_id, user_id string) bool {
	groupDetails, err := g.GroupRepo.IsOwner(group_id, user_id)
	if err != nil {
		return groupDetails
	}
	return groupDetails
}

func (g *GroupService) JoinGroup(group_id, user_id, isInvited string) error {
	return g.GroupRepo.JoinGroup(group_id, user_id, isInvited)
}

func (g *GroupService) GroupDelete(group_id string) error {
	return g.GroupRepo.GroupDelete(group_id)
}

func (g *GroupService) GroupRequest(group_id string) ([]models.GroupRequest, error) {
	return g.GroupRepo.GroupRequest(group_id)
}

func (g *GroupService) GroupResponse(group_id string, groupResponse models.GroupResponse) (int, error) {
	if groupResponse.Respose == "accepted" {
		return g.GroupRepo.GroupResponseAccepted(group_id, groupResponse.User_id)
	}
	return g.GroupRepo.GroupResponseDeclined(group_id, groupResponse.User_id)
}

func (g *GroupService) GroupLeave(group_id, user_id string) (int, error) {
	return g.GroupRepo.GroupResponseDeclined(group_id, user_id)
}

func (g *GroupService) GroupCreatePost(postInfo models.GroupPost, user_id string) (models.GroupPost, error) {
	isMember := g.IsGroupMember(postInfo.Group_id, user_id)
	IsOwner := g.IsOwner(postInfo.Group_id, user_id)
	if !isMember && !IsOwner {
		return models.GroupPost{}, fmt.Errorf("forbidden")
	}

	imageFilename, err := utils.SaveImage(postInfo.Image)
	if err != nil {
		return models.GroupPost{}, err
	}
	post_id := uuid.Must(uuid.NewV4()).String()
	return g.GroupRepo.GroupCreatePost(post_id, postInfo, user_id, imageFilename)
}

func (g *GroupService) GroupPost(group_id, user_id string, pagination int) ([]models.GroupPost, error) {
	isMember := g.IsGroupMember(group_id, user_id)
	IsOwner := g.IsOwner(group_id, user_id)
	fmt.Println(IsOwner)
	if !isMember && !IsOwner {
		return []models.GroupPost{}, fmt.Errorf("forbidden")
	}
	posts, err := g.GroupRepo.GroupPost(group_id, user_id, pagination)
	fmt.Println(err)
	return posts, err
}

func (g *GroupService) CreateEvent(event models.Event, user_id string) (models.Event, error) {
	isMember := g.IsGroupMember(event.Group_id, user_id)
	IsOwner := g.IsOwner(event.Group_id, user_id)
	fmt.Println(isMember, IsOwner)
	if !isMember && !IsOwner {
		return models.Event{}, fmt.Errorf("forbbiden")
	}
	event_id := uuid.Must(uuid.NewV4()).String()
	return g.GroupRepo.CreateEvent(event, event_id, event.Group_id, user_id)
}

func (g *GroupService) Event(group_id, user_id string) ([]models.Event, error) {
	isMember := g.IsGroupMember(group_id, user_id)
	IsOwner := g.IsOwner(group_id, user_id)
	if !isMember && !IsOwner {
		return []models.Event{}, fmt.Errorf("forbbiden")
	}

	return g.GroupRepo.Event(group_id, user_id)
}

func (g *GroupService) EventResponse(group_id, event_id, user_id, response string) (models.Event, error) {
	isMember := g.IsGroupMember(group_id, user_id)
	IsOwner := g.IsOwner(group_id, user_id)
	if !isMember && !IsOwner {
		return models.Event{}, fmt.Errorf("forbbiden")
	}
	response_id := uuid.Must(uuid.NewV4()).String()
	return g.GroupRepo.EventResponse(response_id,event_id, user_id, response)
}
