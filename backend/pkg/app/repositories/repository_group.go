package repositories

import (
	"database/sql"
	"fmt"
	"time"

	"blank/pkg/app/models"

	"github.com/gofrs/uuid/v5"
)

type GroupRepository struct {
	DB *sql.DB
}

func (g *GroupRepository) CreateGroup(group models.Group, user_id any, group_id string) (models.GroupDetails, error) {
	query := "INSERT INTO `Group` (group_id,creator_id,title,description) VALUES (?,?,?,?)"
	var groupInfo models.GroupDetails
	_, err := g.DB.Exec(query, group_id, user_id, group.GroupTitle, group.GroupDescription)
	if err != nil {
		return models.GroupDetails{}, err
	}
	g.JoinGroup(group_id, user_id.(string), "accepted")
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
		return models.GroupDetails{}, err
	}
	groupInfo.IsOwner = true
	return groupInfo, nil
}

func (g *GroupRepository) Groups(user_id string, page int) ([]models.GroupDetails, error) {
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
	) as is_pending,
	COUNT(*) OVER() AS total_count
FROM ` + "`Group`" + ` g
JOIN ` + "`User`" + ` u ON g.creator_id = u.user_id
LEFT JOIN ` + "`Group_Membership`" + ` gm ON g.group_id = gm.group_id
GROUP BY g.group_id, g.title, g.description, u.nickname
ORDER BY g.created_at
LIMIT 20 OFFSET ?;
`
	rows, err := g.DB.Query(selectQuery, user_id, page)
	if err != nil {
		return nil, err
	}
	var groups []models.GroupDetails
	for rows.Next() {
		var group models.GroupDetails
		err = rows.Scan(
			&group.GroupeId,
			&group.UserId,
			&group.Name,
			&group.Description,
			&group.Member_count,
			&group.IsPending,
			&group.TotalCount,
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

func (g *GroupRepository) GroupsSearch(user_id, term string) ([]models.GroupDetails, error) {
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
	var groups []models.GroupDetails
	for rows.Next() {
		var group models.GroupDetails
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

func (g *GroupRepository) GroupDetails(user_id, group_id string) (models.GroupDetails, error) {
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
	EXISTS (
		SELECT 1 FROM Group_Membership 
		WHERE group_id = g.group_id 
		AND user_id = ? 
		AND status = 'invite' 
	) as is_invited,
	g.created_at
FROM ` + "`Group`" + ` g
JOIN ` + "`User`" + ` u ON g.creator_id = u.user_id
LEFT JOIN ` + "`Group_Membership`" + ` gm ON g.group_id = gm.group_id
WHERE g.group_id = ?
GROUP BY g.group_id, g.title, g.description, u.user_id, u.first_name, u.last_name, g.created_at;
`
	err := g.DB.QueryRow(selectQuery, user_id,user_id, group_id).Scan(
		&group.GroupeId,
		&group.Name,
		&group.Description,
		&group.UserId,
		&group.First_Name,
		&group.Last_Name,
		&group.Member_count,
		&group.IsPending,
		&group.IsInvited,
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

func (g *GroupRepository) IsPendingRequest(group_id, user_id string) (bool, error) {
	exist := 0
	query := `SELECT count(*) FROM Group_Membership WHERE group_id = ? AND user_id = ? AND status = 'requested'`
	err := g.DB.QueryRow(query, group_id, user_id).Scan(&exist)
	if err != nil {
		return false, err
	}
	if exist == 1 {
		return true, nil
	}
	return false, nil
}

func (g *GroupRepository) PostGroupExist(post_id string) bool {
	exist := 0
	query := `SELECT count(*) FROM Group_Post WHERE group_post_id = ?`
	err := g.DB.QueryRow(query, post_id).Scan(&exist)
	if err != nil {
		return false
	}
	if exist == 1 {
		return true
	}
	return false
}

func (g *GroupRepository) IsOwner(group_id, user_id string) (bool, error) {
	exist := 0
	query := "SELECT count(*) FROM `Group` WHERE group_id = ? AND creator_id = ?"
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

func (g *GroupRepository) GetFollowers(groupId, userId, offset string) ([]models.FollowList, error) {
	query := `
        SELECT 
            u.user_id,
            u.first_name,
            u.last_name,
            u.avatar
        FROM Follow f
        JOIN User u ON f.follower_id = u.user_id
        WHERE f.following_id = ? 
        AND f.status = "accepted"
        AND NOT EXISTS (
            SELECT 1 FROM Group_Membership gm 
            WHERE gm.group_id = ? 
            AND gm.user_id = u.user_id
        )
        AND (? = '' OR u.user_id > ?)
        ORDER BY u.user_id
        LIMIT 21`

	rows, err := g.DB.Query(query, userId, groupId, offset, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var followers []models.FollowList

	for rows.Next() {
		var follower models.FollowList
		err := rows.Scan(&follower.UserId, &follower.FirstName, &follower.LastName, &follower.Avatar)
		if err != nil {
			return nil, err
		}
		followers = append(followers, follower)
	}

	return followers, nil
}

func (g *GroupRepository) SearchFollowers(groupId, userId, offset, searchQuery string) ([]models.FollowList, error) {
	query := `
        SELECT 
            u.user_id,
            u.first_name,
            u.last_name,
            u.avatar
        FROM Follow f
        JOIN User u ON f.follower_id = u.user_id
        WHERE f.following_id = ? 
        AND f.status = "accepted"
		AND (u.first_name LIKE ? OR u.last_name LIKE ?)
        AND NOT EXISTS (
            SELECT 1 FROM Group_Membership gm 
            WHERE gm.group_id = ? 
            AND gm.user_id = u.user_id
        )
        AND (? = '' OR u.user_id > ?)
        ORDER BY u.user_id
        LIMIT 21`

	rows, err := g.DB.Query(query, userId, "%"+searchQuery+"%", "%"+searchQuery+"%", groupId, offset, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var followers []models.FollowList

	for rows.Next() {
		var follower models.FollowList
		err := rows.Scan(&follower.UserId, &follower.FirstName, &follower.LastName, &follower.Avatar)
		if err != nil {
			return nil, err
		}
		followers = append(followers, follower)
	}

	return followers, nil
}

func (g *GroupRepository) GroupDelete(group_id string) error {
	query := "DELETE FROM `Group` WHERE group_id = ?"
	_, err := g.DB.Exec(query, group_id)
	if err != nil {
		return err
	}
	return nil
}

func (g *GroupRepository) GroupRequest(group_id string, page int) ([]models.GroupRequest, error) {
	query := `SELECT group_id,u.user_id, u.first_name, u.last_name,COUNT(*) OVER() AS total_count FROM User u 
			  JOIN Group_Membership gm ON u.user_id = gm.user_id 
			  WHERE gm.group_id = ? AND gm.status = 'requested'
			  LIMIT 20 OFFSET ?;`
	var groupRequests []models.GroupRequest
	rows, err := g.DB.Query(query, group_id, page)
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
			&groupRequest.TotalCount,
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

func (g *GroupRepository) GroupResponseAccepted(group_id, user_id string) (int, error) {
	query := "UPDATE `Group_Membership` SET status = 'accepted' WHERE group_id = ? AND user_id =?"
	var memberCount int
	_, err := g.DB.Exec(query, group_id, user_id)
	if err != nil {
		return 0, err
	}
	query = `SELECT count(*) FROM Group_Membership WHERE group_id = ? AND status = 'accepted'`
	err = g.DB.QueryRow(query, group_id).Scan(&memberCount)
	if err != nil {
		return 0, err
	}
	return memberCount, nil
}

func (g *GroupRepository) GroupResponseDeclined(group_id, user_id string) (int, error) {
	query := "DELETE FROM `Group_Membership` WHERE group_id = ? AND user_id =?"

	_, err := g.DB.Exec(query, group_id, user_id)
	if err != nil {
		return 0, err
	}

	return 0, nil
}

func (g *GroupRepository) GroupCreatePost(post_id string, group models.GroupPost, user_id, FileName string) (models.GroupPost, error) {
	query := "INSERT INTO `Group_Post` (group_post_id,group_id,user_id,content,image) VALUES (?,?,?,?,?)"
	var groupInfo models.GroupPost

	_, err := g.DB.Exec(query, post_id, group.Group_id, user_id, group.Content, FileName)
	if err != nil {
		return models.GroupPost{}, err
	}

	querySelect := `SELECT 
	Group_Post.group_post_id,
	Group_Post.group_id,
	Group_Post.content,
	Group_Post.image,
	Group_Post.created_at,
	User.user_id,
	User.first_name,
	User.last_name,
	User.avatar,
	CASE
		WHEN comment_counts.comment_count > 100 THEN '+100'
		ELSE IFNULL(CAST(comment_counts.comment_count AS TEXT), '0')
	END AS comment_count,
	(SELECT COUNT(*) FROM Like WHERE Like.group_post_id = Group_Post.group_post_id) AS like_count,
	EXISTS(SELECT 1 FROM Like WHERE Like.group_post_id = Group_Post.group_post_id AND Like.user_id = ?) AS has_liked,
	COUNT(*) OVER() AS total_count
	FROM 
		   Group_Post
	JOIN 
		User ON Group_Post.user_id = User.user_id
	LEFT JOIN 
		(SELECT group_post_id, COUNT(*) AS comment_count FROM Comment GROUP BY group_post_id) AS comment_counts
		ON Group_Post.group_post_id = comment_counts.group_post_id
	WHERE
	Group_Post.group_post_id= ? 
		GROUP BY 
		Group_Post.group_post_id
	ORDER BY 
		Group_Post.created_at DESC;`
	err = g.DB.QueryRow(querySelect, user_id, post_id).Scan(
		&groupInfo.Post_id,
		&groupInfo.Group_id,
		&groupInfo.Content,
		&groupInfo.Image,
		&groupInfo.CreatedAt,
		&groupInfo.User_id,
		&groupInfo.FirstName,
		&groupInfo.LastName,
		&groupInfo.Avatar,
		&groupInfo.CommentCount,
		&groupInfo.LikeCount,
		&groupInfo.HasLiked,
		&groupInfo.TotalCount)
	if err != nil {
		return models.GroupPost{}, err
	}
	groupInfo.FormattedDate = groupInfo.CreatedAt.Format("01/02/2006, 3:04:05 PM")
	return groupInfo, nil
}

func (g *GroupRepository) GroupPost(group_id, user_id string, pagination int) ([]models.GroupPost, error) {
	var groupInfos []models.GroupPost
	querySelect := `
		SELECT 
		Group_Post.group_post_id,
		Group_Post.group_id,
		Group_Post.content,
		Group_Post.image,
		Group_Post.created_at,
		User.user_id,
		User.first_name,
		User.last_name,
		User.avatar,
		CASE
			WHEN comment_counts.comment_count > 100 THEN '+100'
			ELSE IFNULL(CAST(comment_counts.comment_count AS TEXT), '0')
		END AS comment_count,
		(SELECT COUNT(*) FROM Like WHERE Like.group_post_id = Group_Post.group_post_id ) AS like_count,
		EXISTS(SELECT 1 FROM Like WHERE Like.group_post_id = Group_Post.group_post_id AND Like.user_id = ?) AS has_liked,
		COUNT(*) OVER() AS total_count
		FROM 
			Group_Post
		JOIN 
			User ON Group_Post.user_id = User.user_id
		LEFT JOIN 
			(SELECT group_post_id, COUNT(*) AS comment_count FROM Comment GROUP BY group_post_id) AS comment_counts
			ON Group_Post.group_post_id = comment_counts.group_post_id
		WHERE
		Group_Post.group_id= ? 
			GROUP BY 
			Group_Post.group_post_id
		ORDER BY 
			Group_Post.created_at DESC 
		LIMIT 20 OFFSET ?;
	`
	rows, err := g.DB.Query(querySelect, user_id, group_id, pagination)
	if err != nil {
		return nil, fmt.Errorf("error querying posts with user info: %v", err)
	}
	defer rows.Close()
	for rows.Next() {
		var groupInfo models.GroupPost
		err = rows.Scan(
			&groupInfo.Post_id,
			&groupInfo.Group_id,
			&groupInfo.Content,
			&groupInfo.Image,
			&groupInfo.CreatedAt,
			&groupInfo.User_id,
			&groupInfo.FirstName,
			&groupInfo.LastName,
			&groupInfo.Avatar,
			&groupInfo.CommentCount,
			&groupInfo.LikeCount,
			&groupInfo.HasLiked,
			&groupInfo.TotalCount)
		if err != nil {
			return nil, fmt.Errorf("error scanning post with user info: %v", err)
		}
		groupInfo.FormattedDate = groupInfo.CreatedAt.Format("01/02/2006, 3:04:05 PM")
		groupInfos = append(groupInfos, groupInfo)
	}
	err = rows.Err()
	if err != nil {
		return []models.GroupPost{}, err
	}
	return groupInfos, nil
}

func (g *GroupRepository) CreateEvent(event models.Event, event_id, group_id, user_id string) (models.Event, error) {
	query := "INSERT INTO Event (event_id,group_id,creator_id,title,description, event_datetime) VALUES (?,?,?,?,?,?)"
	var groupInfo models.Event
	eventDateTime, err := time.Parse("2006-01-02 15:04", event.Date+" "+event.Time)
	if err != nil {
		return groupInfo, err
	}
	_, err = g.DB.Exec(query, event_id, group_id, user_id, event.Title, event.Description, eventDateTime)
	if err != nil {
		return groupInfo, err
	}
	selectQuery := `
	SELECT 
		e.event_id,
		e.title,
		e.description,
		e.event_datetime,
		e.group_id,
		e.creator_id
	FROM Event e
	WHERE e.event_id = ?
	`
	var dateTime time.Time
	err = g.DB.QueryRow(selectQuery, event_id).Scan(&event.Event_id, &event.Title, &event.Description, &dateTime, &event.Group_id, &event.User_id)
	event.Date = dateTime.Format("2006-01-02")
	event.Time = dateTime.Format("15:04")
	if err != nil {
		return event, err
	}
	return event, nil
}

func (g *GroupRepository) Event(group_id, user_id string, page int) ([]models.Event, error) {
	selectQuery := `
	SELECT 
		e.event_id,
		e.title,
		e.description,
		e.event_datetime,
		e.group_id,
		e.creator_id,
		COUNT(CASE WHEN er.response = 'going' THEN 1 END) as going_count,
		CASE WHEN EXISTS(
			SELECT 1 FROM Event_Response 
			WHERE event_id = e.event_id 
			AND user_id = ? 
			AND response = 'going'
		) THEN TRUE ELSE FALSE END as is_going,
		 COUNT(*) OVER() AS total_count
	FROM Event e
	LEFT JOIN Event_Response er ON e.event_id = er.event_id
	WHERE e.group_id = ?
	GROUP BY e.event_id
	ORDER BY e.event_datetime ASC
	LIMIT 20 OFFSET ?;
	`

	rows, err := g.DB.Query(selectQuery, user_id, group_id, page)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var events []models.Event
	for rows.Next() {
		var event models.Event
		var dateTime time.Time
		err = rows.Scan(
			&event.Event_id,
			&event.Title,
			&event.Description,
			&dateTime,
			&event.Group_id,
			&event.User_id,
			&event.Going_count,
			&event.Is_going,
			&event.TotalCount,
		)
		if err != nil {
			return nil, err
		}
		event.Date = dateTime.Format("2006-01-02")
		event.Time = dateTime.Format("15:04")
		events = append(events, event)
	}

	return events, nil
}

func (g *GroupRepository) EventResponse(response_id, event_id, user_id, response string) (models.Event, error) {
	
	checkQuery := "SELECT response FROM `Event_Response` WHERE event_id = ? AND user_id = ?"
	var existingResponse string
	err := g.DB.QueryRow(checkQuery, event_id, user_id).Scan(&existingResponse)

	if err != nil && err != sql.ErrNoRows {
		return models.Event{}, err
	}

	if err == nil && existingResponse == response {
		deleteQuery := "DELETE FROM `Event_Response` WHERE event_id = ? AND user_id = ?"
		_, err = g.DB.Exec(deleteQuery, event_id, user_id)
		if err != nil {
			return models.Event{}, err
		}
	} else if err == nil {
		updateQuery := "UPDATE `Event_Response` SET response = ?, response_id = ? WHERE event_id = ? AND user_id = ?"
		_, err = g.DB.Exec(updateQuery, response, response_id, event_id, user_id)
		if err != nil {
			return models.Event{}, err
		}
	} else {
		insertQuery := "INSERT INTO `Event_Response` (response_id, event_id, user_id, response) VALUES (?, ?, ?, ?)"
		_, err = g.DB.Exec(insertQuery, response_id, event_id, user_id, response)
		if err != nil {
			return models.Event{}, err
		}
	}

	countQuery := `
	SELECT 
		e.event_id,
		COUNT(CASE WHEN er.response = 'going' THEN 1 END) as going_count,
		CASE WHEN EXISTS(
			SELECT 1 FROM Event_Response 
			WHERE event_id = ? 
			AND user_id = ? 
			AND response = 'going'
		) THEN TRUE ELSE FALSE END as is_going
	FROM Event e
	LEFT JOIN Event_Response er ON e.event_id = er.event_id
	WHERE e.event_id = ?
	GROUP BY e.event_id`

	var event models.Event
	err = g.DB.QueryRow(countQuery, event_id, user_id, event_id).Scan(&event.Event_id, &event.Going_count, &event.Is_going)
	if err != nil {
		return models.Event{}, err
	}

	return event, nil
}

func (g *GroupRepository) GetGroupMembers(senderID, groupID uuid.UUID) ([]uuid.UUID, error) {
	selectQuery := `
		SELECT 
			user_id
		FROM Group_Membership
		WHERE group_id = ? AND user_id != ?
	`
	rows, err := g.DB.Query(selectQuery, groupID, senderID)
	if err != nil {
		return nil, err
	}

	var members []uuid.UUID

	for rows.Next() {
		var userID uuid.UUID
		err = rows.Scan(&userID)
		if err != nil {
			return nil, fmt.Errorf("error scanning user ID: %v", err)
		}
		members = append(members, userID)
	}
	err = rows.Err()
	if err != nil {
		return nil, fmt.Errorf("error iterating users : %v", err)
	}

	return members, nil
}

func (g *GroupRepository) GroupExist(groupID uuid.UUID) (bool, error) {
	var num int
	query := `SELECT COUNT(*) FROM 'Group' WHERE group_id = ?`
	row := g.DB.QueryRow(query, groupID)
	err := row.Scan(&num)
	if err != nil {
		return false, err
	}
	if num == 1 {
		return true, nil
	}
	return false, nil
}

func (g *GroupRepository) GetGroupTitle(groupID uuid.UUID) (string, error) {
	var title string
	query := `SELECT title FROM 'Group' WHERE group_id = ?`
	row := g.DB.QueryRow(query, groupID)
	err := row.Scan(&title)
	if err != nil {
		return "", err
	}

	return title, nil
}

func (g *GroupRepository) GetGroupOwner(groupID uuid.UUID) (uuid.UUID, error) {
	var ownerID uuid.UUID
	query := "SELECT creator_id FROM `Group` WHERE group_id = ?"
	err := g.DB.QueryRow(query, groupID).Scan(&ownerID)
	if err != nil {
		return uuid.Nil, err
	}

	return ownerID, nil
}

func (g *GroupRepository) CheckGroupInvitationPending(notifID, userID, groupID uuid.UUID) (bool, error) {
	isPending := false
	query := `
		SELECT
			EXISTS (
				SELECT
					1
				FROM
					Group_Membership gm
				WHERE
					gm.group_id = ?
					AND gm.user_id = ?
					AND gm.status = "invite"
			) AS is_pending
	`

	err := g.DB.QueryRow(query, groupID, userID).Scan(&isPending)
	if err != nil {
		return false, err
	}

	return isPending, nil
}

func (g *GroupRepository) CheckInvitePending(groupID, userID uuid.UUID) (bool, error) {
	isPending := false
	query := `
		SELECT
			EXISTS (
				SELECT
					1
				FROM
				Group_Membership gm
				WHERE
					gm.group_id = ?
					AND gm.user_id = ?
					AND gm.status = "invite"
			) AS is_pending
	`

	err := g.DB.QueryRow(query, groupID, userID).Scan(&isPending)
	if err != nil {
		return false, err
	}

	return isPending, nil
}

func (g *GroupRepository) AcceptInvitation(groupID, userID uuid.UUID) error {
	preparedQuery, err := g.DB.Prepare("UPDATE Group_Membership SET status = ? WHERE group_id = ? AND user_id = ?")
	if err != nil {
		return err
	}
	_, err = preparedQuery.Exec("accepted", groupID, userID)
	return err
}

func (g *GroupRepository) RefuseInvitation(groupID, userID uuid.UUID) error {
	preparedQuery, err := g.DB.Prepare("DELETE FROM Group_Membership WHERE group_id = ? AND user_id = ?")
	if err != nil {
		return err
	}
	_, err = preparedQuery.Exec(groupID, userID)
	return err
}
