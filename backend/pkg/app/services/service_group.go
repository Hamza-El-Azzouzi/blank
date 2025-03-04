package services

import (
	"fmt"
	"time"

	"blank/pkg/app/models"
	"blank/pkg/app/repositories"
	"blank/pkg/app/utils"

	"github.com/gofrs/uuid/v5"
)

type GroupService struct {
	GroupRepo *repositories.GroupRepository
}

func (g *GroupService) CreateGroup(data models.Group, user_id string) (models.GroupDetails, error) {
	group_id := uuid.Must(uuid.NewV4()).String()
	if data.GroupTitle == "" || data.GroupDescription == "" {
		return models.GroupDetails{}, fmt.Errorf("title and description are required")
	}
	if len(data.GroupTitle) > 50 || len(data.GroupDescription) > 200 {
		return models.GroupDetails{}, fmt.Errorf("title must be less than 50 characters and description less than 200 characters")
	}
	return g.GroupRepo.CreateGroup(data, user_id, group_id)
}

func (g *GroupService) Groups(user_id string, page int) ([]models.GroupDetails, error) {
	groups, err := g.GroupRepo.Groups(user_id, page)
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
	if term == "" {
		return []models.GroupDetails{}, fmt.Errorf("search term is required")
	}
	if len(term) > 50 {
		return []models.GroupDetails{}, fmt.Errorf("search term must be less than 50 characters")
	}
	if !utils.IsAlphanumeric(term) {
		return []models.GroupDetails{}, fmt.Errorf("search term must contain only letters, numbers and spaces")
	}
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
	if g.IsGroupMember(group_id, user_id) {
		return fmt.Errorf("forbidden")
	}
	return g.GroupRepo.JoinGroup(group_id, user_id, isInvited)
}

func (g *GroupService) GroupDelete(group_id, user_id string) error {
	if !g.IsOwner(group_id, user_id) {
		return fmt.Errorf("forbidden")
	}
	return g.GroupRepo.GroupDelete(group_id)
}

func (g *GroupService) GroupRequest(group_id, user_id string, page int) ([]models.GroupRequest, error) {
	if !g.IsOwner(group_id, user_id) {
		return nil, fmt.Errorf("forbidden")
	}
	return g.GroupRepo.GroupRequest(group_id, page)
}

func (g *GroupService) GroupResponse(group_id, user_id_creator string, groupResponse models.GroupResponse) (int, error) {
	if !g.IsOwner(group_id, user_id_creator) {
		return 0, fmt.Errorf("forbidden")
	}
	if groupResponse.Respose == "accepted" {
		return g.GroupRepo.GroupResponseAccepted(group_id, groupResponse.User_id)
	}
	return g.GroupRepo.GroupResponseDeclined(group_id, groupResponse.User_id)
}

func (g *GroupService) GroupLeave(group_id, user_id string) (int, error) {
	if !g.IsGroupMember(group_id, user_id) {
		return 0, fmt.Errorf("forbidden")
	}
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
	if !isMember && !IsOwner {
		return []models.GroupPost{}, fmt.Errorf("forbidden")
	}
	posts, err := g.GroupRepo.GroupPost(group_id, user_id, pagination)

	return posts, err
}

func (g *GroupService) CreateEvent(event models.Event, user_id string) (models.Event, error) {
	isMember := g.IsGroupMember(event.Group_id, user_id)
	IsOwner := g.IsOwner(event.Group_id, user_id)

	if !isMember && !IsOwner {
		return models.Event{}, fmt.Errorf("forbbiden")
	}
	if event.Title == "" || event.Description == "" {
		return models.Event{}, fmt.Errorf("title and description are required")
	}
	if len(event.Title) > 50 || len(event.Description) > 200 {
		return models.Event{}, fmt.Errorf("title must be less than 50 characters and description less than 200 characters")
	}
	eventDate, err := time.Parse("2006-01-02", event.Date)
	if err != nil {
		return models.Event{}, fmt.Errorf("invalid date format, use YYYY-MM-DD")
	}
	if eventDate.Before(time.Now()) {
		return models.Event{}, fmt.Errorf("event date must be in the future")
	}
	event_id := uuid.Must(uuid.NewV4()).String()

	event, err = g.GroupRepo.CreateEvent(event, event_id, event.Group_id, user_id)
	if err != nil {
		return models.Event{}, err
	}

	GroupID, err := uuid.FromString(event.Group_id)
	if err != nil {
		return models.Event{}, err
	}

	event.Group_title, err = g.GroupRepo.GetGroupTitle(GroupID)
	if err != nil {
		return models.Event{}, err
	}
	return event, nil
}

func (g *GroupService) Event(group_id, user_id string, page int) ([]models.Event, error) {
	isMember := g.IsGroupMember(group_id, user_id)
	IsOwner := g.IsOwner(group_id, user_id)
	if !isMember && !IsOwner {
		return []models.Event{}, fmt.Errorf("forbbiden")
	}

	return g.GroupRepo.Event(group_id, user_id, page)
}

func (g *GroupService) EventResponse(group_id, event_id, user_id, response string) (models.Event, error) {
	isMember := g.IsGroupMember(group_id, user_id)
	IsOwner := g.IsOwner(group_id, user_id)
	if !isMember && !IsOwner {
		return models.Event{}, fmt.Errorf("forbbiden")
	}
	if response != "going" && response != "not-going" {
		return models.Event{}, fmt.Errorf("invalid response, must be 'going' or 'no_going'")
	}
	response_id := uuid.Must(uuid.NewV4()).String()
	return g.GroupRepo.EventResponse(response_id, event_id, user_id, response)
}

func (g *GroupService) GetGroupMembers(userID, groupID uuid.UUID) ([]uuid.UUID, error) {
	return g.GroupRepo.GetGroupMembers(userID, groupID)
}

func (g *GroupService) GetGroupOwner(groupID uuid.UUID) (uuid.UUID, string, error) {
	groupOwnerID, err := g.GroupRepo.GetGroupOwner(groupID)
	if err != nil {
		return uuid.Nil, "", err
	}
	groupTitle, err := g.GroupRepo.GetGroupTitle(groupID)
	if err != nil {
		return uuid.Nil, "", err
	}
	return groupOwnerID, groupTitle, nil
}
