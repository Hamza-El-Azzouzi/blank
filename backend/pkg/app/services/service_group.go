package services

import (
	"blank/pkg/app/models"
	"blank/pkg/app/repositories"

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
	groups , err := g.GroupRepo.Groups(user_id)
	if err != nil{
		return []models.GroupDetails{},err
	}
	for i:= 0 ; i < len(groups) ;i++{
		if groups[i].UserId == user_id {
			groups[i].IsOwner = true
		} else {
			groups[i].IsOwner = false
			groups[i].IsJoined = g.IsGroupMember(groups[i].GroupeId,user_id)
		}
	}
	
	return groups, nil 
}
func (g *GroupService) GroupsSearch(user_id, term string) ([]models.GroupDetails, error) {
	groups , err := g.GroupRepo.GroupsSearch(user_id,term)
	if err != nil{
		return []models.GroupDetails{},err
	}
	for i:= 0 ; i < len(groups) ;i++{
		if groups[i].UserId == user_id {
			groups[i].IsOwner = true
		} else {
			groups[i].IsOwner = false
			groups[i].IsJoined = g.IsGroupMember(groups[i].GroupeId,user_id)
		}
	}
	
	return groups, nil 
}


func (g *GroupService) GroupDerails(user_id,group_id string) (models.GroupDetails, error) {
	groupDetails, err := g.GroupRepo.GroupDerails(user_id,group_id)
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

func (g *GroupService) JoinGroup(group_id, user_id ,isInvited string) error {
	return g.GroupRepo.JoinGroup(group_id, user_id, isInvited)
}

func (g *GroupService) GroupDelete(group_id string) error {
	return g.GroupRepo.GroupDelete(group_id)
}
func (g *GroupService) GroupRequest(group_id string) ([]models.GroupRequest,error) {
	return g.GroupRepo.GroupRequest(group_id)
}

func (g *GroupService) GroupResponse(group_id string, groupResponse models.GroupResponse) (int,error) {
	if groupResponse.Respose == "accepted" {
		return g.GroupRepo.GroupResponseAccepted(group_id,groupResponse.User_id)
	}
	return g.GroupRepo.GroupResponseDeclined(group_id,groupResponse.User_id)
	
}

func (g *GroupService) GroupLeave(group_id, user_id string) (int,error) {
	return g.GroupRepo.GroupResponseDeclined(group_id,user_id)
	
}
