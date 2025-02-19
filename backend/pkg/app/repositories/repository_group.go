package repositories

import (
	"database/sql"
	"fmt"

	"blank/pkg/app/models"
)

type GroupRepository struct {
	DB *sql.DB
}

func (g *GroupRepository) CreateGroup(group models.Group, user_id any, group_id string) (models.GroupInfo, error) {
	fmt.Println(group.GroupTitle, group.GroupDescription)
	query := "INSERT INTO `Group` (group_id,creator_id,title,description) VALUES (?,?,?,?)"
	var groupInfo models.GroupInfo
	_, err := g.DB.Exec(query, group_id, user_id, group.GroupTitle, group.GroupDescription)
	if err != nil {
		return models.GroupInfo{}, err
	}
	selectQuery := `SELECT 
	g.group_id,
	g.title AS group_name,
	g.description,
	COUNT(CASE WHEN gm.status = 'accepted' THEN gm.user_id END) AS member_count
FROM ` + "`Group`" + ` g
JOIN ` + "`User`" + ` u ON g.creator_id = u.user_id
LEFT JOIN ` + "`Group_Membership`" + ` gm ON g.group_id = gm.group_id
WHERE g.group_id = ?
GROUP BY g.group_id, g.title, g.description, u.nickname;
`
	err = g.DB.QueryRow(selectQuery, group_id).Scan(&groupInfo.GroupeId, &groupInfo.Name, &groupInfo.Description, &groupInfo.Member_count)
	if err != nil {
		fmt.Println("seconf", err)
		return models.GroupInfo{}, err
	}
	groupInfo.IsOwner = true
	return groupInfo, nil
}

func (g *GroupRepository) Groups(user_id string) ([]models.Groups, error) {
	selectQuery := `SELECT 
	g.group_id,
	u.user_id,
	g.title AS group_name,
	g.description,
	COUNT(CASE WHEN gm.status = 'accepted' THEN gm.user_id END) AS member_count,
	EXISTS (
		SELECT 1 FROM Group_Membership 
		WHERE group_id = g.group_id 
		AND user_id = ? 
		AND status = 'requested'
	) as is_pending
FROM ` + "`Group`" + ` g
JOIN ` + "`User`" + ` u ON g.creator_id = u.user_id
LEFT JOIN ` + "`Group_Membership`" + ` gm ON g.group_id = gm.group_id
GROUP BY g.group_id, g.title, g.description, u.nickname;
`
	rows, err := g.DB.Query(selectQuery, user_id)
	if err != nil {
		return nil, err
	}
	var groups []models.Groups
	for rows.Next() {
		var group models.Groups
		err = rows.Scan(
			&group.GroupeId,
			&group.UserId,
			&group.Name,
			&group.Description,
			&group.Member_count,
			&group.IsPending,
		)
		if err != nil {
			return nil, fmt.Errorf("error scanning post with user info: %v", err)
		}
		groups = append(groups, group)
	}
	err = rows.Err()
	if err != nil {
		return nil, fmt.Errorf("error iterating posts with user info: %v", err)
	}

	return groups, nil
}
func (g *GroupRepository) GroupsSearch(user_id, term string) ([]models.Groups, error) {
	selectQuery := `SELECT 
	g.group_id,
	u.user_id,
	g.title AS group_name,
	g.description,
	COUNT(CASE WHEN gm.status = 'accepted' THEN gm.user_id END) AS member_count,
	EXISTS (
		SELECT 1 FROM Group_Membership 
		WHERE group_id = g.group_id 
		AND user_id = ? 
		AND status = 'requested'
	) as is_pending
FROM ` + "`Group`" + ` g
JOIN ` + "`User`" + ` u ON g.creator_id = u.user_id
LEFT JOIN ` + "`Group_Membership`" + ` gm ON g.group_id = gm.group_id
WHERE g.title LIKE ?
GROUP BY g.group_id, g.title, g.description, u.nickname;
`
	rows, err := g.DB.Query(selectQuery, user_id, "%"+term+"%")
	if err != nil {
		return nil, err
	}
	var groups []models.Groups
	for rows.Next() {
		var group models.Groups
		err = rows.Scan(
			&group.GroupeId,
			&group.UserId,
			&group.Name,
			&group.Description,
			&group.Member_count,
			&group.IsPending,
		)
		if err != nil {
			return nil, fmt.Errorf("error scanning post with user info: %v", err)
		}
		groups = append(groups, group)
	}
	err = rows.Err()
	if err != nil {
		return nil, fmt.Errorf("error iterating posts with user info: %v", err)
	}

	return groups, nil
}

func (g *GroupRepository) GroupDerails(user_id, group_id string) (models.GroupDetails, error) {
	var group models.GroupDetails
	selectQuery := `SELECT 
	g.group_id,
	g.title AS group_name,
	g.description,
	u.user_id AS creator_id,
	u.first_name AS first_name,
	u.last_name AS last_name,
	COUNT(CASE WHEN gm.status = 'accepted' THEN gm.user_id END) AS member_count,
	EXISTS (
		SELECT 1 FROM Group_Membership 
		WHERE group_id = g.group_id 
		AND user_id = ? 
		AND status = 'requested'
	) as is_pending,
	g.created_at
FROM ` + "`Group`" + ` g
JOIN ` + "`User`" + ` u ON g.creator_id = u.user_id
LEFT JOIN ` + "`Group_Membership`" + ` gm ON g.group_id = gm.group_id
WHERE g.group_id = ?
GROUP BY g.group_id, g.title, g.description, u.user_id, u.first_name, u.last_name, g.created_at;
`
	err := g.DB.QueryRow(selectQuery, user_id, group_id).Scan(
		&group.GroupeId,
		&group.Name,
		&group.Description,
		&group.UserId,
		&group.First_Name,
		&group.Last_Name,
		&group.Member_count,
		&group.IsPending,
		&group.Created_at,
	)
	if err != nil {
		return models.GroupDetails{}, err
	}
	group.FormatedDate = group.Created_at.Format("January 2006")

	return group, nil
}

func (g *GroupRepository) IsGroupMember(group_id, user_id string) (bool, error) {
	exist := 0
	query := `SELECT count(*) FROM Group_Membership WHERE group_id = ? AND user_id = ? AND status = 'accepted'`
	err := g.DB.QueryRow(query, group_id, user_id).Scan(&exist)
	if err != nil {
		return false, err
	}
	if exist == 1 {
		return true, nil
	}
	return false, nil
}

func (g *GroupRepository) JoinGroup(group_id, user_id, isInvited string) error {
	query := "INSERT INTO `Group_Membership` (group_id,user_id,status) VALUES (?,?,?)"
	_, err := g.DB.Exec(query, group_id, user_id, isInvited)
	if err != nil {
		return err
	}
	return nil
}

func (g *GroupRepository) GroupDelete(group_id string) error {
	query := "DELETE FROM `Group` WHERE group_id = ?"
	_, err := g.DB.Exec(query, group_id)
	if err != nil {
		return err
	}
	return nil
}

func (g *GroupRepository) GroupRequest(group_id string) ([]models.GroupRequest, error) {
	query := `SELECT group_id,u.user_id, u.first_name, u.last_name FROM User u 
			  JOIN Group_Membership gm ON u.user_id = gm.user_id 
			  WHERE gm.group_id = ? AND gm.status = 'requested'`
	var groupRequests []models.GroupRequest
	rows, err := g.DB.Query(query, group_id)
	if err != nil {
		return nil, err
	}

	for rows.Next() {
		var groupRequest models.GroupRequest
		err = rows.Scan(
			&groupRequest.GroupId,
			&groupRequest.UserId,
			&groupRequest.First_Name,
			&groupRequest.Last_Name,
		)
		if err != nil {
			return nil, fmt.Errorf("error scanning post with user info: %v", err)
		}
		groupRequests = append(groupRequests, groupRequest)
	}
	err = rows.Err()
	if err != nil {
		return nil, fmt.Errorf("error iterating posts with user info: %v", err)
	}

	return groupRequests, nil
}

func (g *GroupRepository) GroupResponseAccepted(group_id, user_id string) (int,error) {
	query := "UPDATE `Group_Membership` SET status = 'accepted' WHERE group_id = ? AND user_id =?"
	var memberCount int
	_, err := g.DB.Exec(query, group_id,user_id)
	if err != nil {
		return 0,err
	}
	query = `SELECT count(*) FROM Group_Membership WHERE group_id = ? AND status = 'accepted'`
	err = g.DB.QueryRow(query, group_id).Scan(&memberCount)
	if err != nil {
		return 0,err
	}
	return memberCount,nil
}

func (g *GroupRepository) GroupResponseDeclined(group_id, user_id string) (int,error) {
	query := "DELETE FROM `Group_Membership` WHERE group_id = ? AND user_id =?"

	_, err := g.DB.Exec(query, group_id,user_id)
	if err != nil {
		return 0, err
	}

	return 0,nil
}


