package repositories

import (
	"database/sql"

	"blank/pkg/app/models"

	"github.com/gofrs/uuid/v5"
)

type FollowRepositorie struct {
	DB *sql.DB
}

func (f *FollowRepositorie) CreateFollow(follow models.FollowRequest) error {
	preparedQuery, err := f.DB.Prepare("INSERT INTO Follow (follower_id, following_id, status) VALUES (?, ?, ?)")
	if err != nil {
		return err
	}
	_, err = preparedQuery.Exec(follow.FollowerId, follow.FollowingId, "accepted")
	return err
}

func (f *FollowRepositorie) RequestFollow(follow models.FollowRequest) error {
	preparedQuery, err := f.DB.Prepare("INSERT INTO Follow (follower_id, following_id, status) VALUES (?, ?, ?)")
	if err != nil {
		return err
	}
	_, err = preparedQuery.Exec(follow.FollowerId, follow.FollowingId, "pending")
	return err
}

func (f *FollowRepositorie) AcceptFollow(follow models.FollowRequest) error {
	preparedQuery, err := f.DB.Prepare("UPDATE Follow SET status = ? WHERE follower_id = ? AND following_id = ?")
	if err != nil {
		return err
	}
	_, err = preparedQuery.Exec("accepted", follow.FollowerId, follow.FollowingId)
	return err
}

func (f *FollowRepositorie) RefuseFollow(follow models.FollowRequest) error {
	preparedQuery, err := f.DB.Prepare("DELETE FROM Follow WHERE follower_id = ? AND following_id = ?")
	if err != nil {
		return err
	}
	_, err = preparedQuery.Exec(follow.FollowerId, follow.FollowingId)
	return err
}

func (f *FollowRepositorie) GetFollowStatus(follow models.FollowRequest) (string, error) {
	status := ""
	query := `SELECT status FROM Follow WHERE follower_id = ? AND following_id = ?`
	row := f.DB.QueryRow(query, follow.FollowerId, follow.FollowingId)
	err := row.Scan(&status)
	return status, err
}

func (f *FollowRepositorie) GetFollowers(userId, offset string) ([]models.FollowList, error) {
	query := `
        SELECT 
            u.user_id,
            u.first_name,
            u.last_name,
            u.avatar
        FROM Follow f
        JOIN User u ON f.follower_id = u.user_id
        WHERE f.following_id = ? AND f.status = "accepted"
        AND (? = '' OR u.user_id > ?)
        ORDER BY u.user_id
        LIMIT 21`

	rows, err := f.DB.Query(query, userId, offset, offset)
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

func (f *FollowRepositorie) GetFollowing(userId, offset string) ([]models.FollowList, error) {
	query := `
        SELECT 
            u.user_id,
            u.first_name,
            u.last_name,
            u.avatar
        FROM Follow f
        JOIN User u ON f.following_id = u.user_id
        WHERE f.follower_id = ? AND f.status = "accepted"
        AND (? = '' OR u.user_id > ?)
        ORDER BY u.user_id
        LIMIT 21`

	rows, err := f.DB.Query(query, userId, offset, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var following []models.FollowList
	for rows.Next() {
		var follower models.FollowList
		err := rows.Scan(&follower.UserId, &follower.FirstName, &follower.LastName, &follower.Avatar)
		if err != nil {
			return nil, err
		}
		following = append(following, follower)
	}

	return following, nil
}

func (f *FollowRepositorie) DeleteFollow(followData models.FollowRequest) error {
	preparedQuery, err := f.DB.Prepare("DELETE FROM Follow WHERE follower_id = ? AND following_id = ?")
	if err != nil {
		return err
	}
	_, err = preparedQuery.Exec(followData.FollowerId, followData.FollowingId)
	return err
}

func (f *FollowRepositorie) SearchFollowers(userId uuid.UUID, searchQuery string) ([]models.FollowList, error) {
	query := `
        SELECT 
            u.user_id,
            u.first_name,
            u.last_name,
            u.avatar
        FROM Follow f
        JOIN User u ON f.follower_id = u.user_id
        WHERE f.following_id = ? AND f.status = "accepted" AND (u.first_name LIKE ? OR u.last_name LIKE ?)
        AND (? = '' OR u.user_id > ?)
        ORDER BY u.user_id
        LIMIT 21`

	rows, err := f.DB.Query(query, userId, "%"+searchQuery+"%", "%"+searchQuery+"%", userId, userId)
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

func (f *FollowRepositorie) SearchFollowing(userId uuid.UUID, searchQuery string) ([]models.FollowList, error) {
	query := `
        SELECT 
            u.user_id,
            u.first_name,
            u.last_name,
            u.avatar
        FROM Follow f
        JOIN User u ON f.following_id = u.user_id
        WHERE f.follower_id = ? AND f.status = "accepted" AND (u.first_name LIKE ? OR u.last_name LIKE ?)
        AND (? = '' OR u.user_id > ?)
        ORDER BY u.user_id
        LIMIT 21`

	rows, err := f.DB.Query(query, userId, "%"+searchQuery+"%", "%"+searchQuery+"%", userId, userId)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var followings []models.FollowList

	for rows.Next() {
		var following models.FollowList
		err := rows.Scan(&following.UserId, &following.FirstName, &following.LastName, &following.Avatar)
		if err != nil {
			return nil, err
		}
		followings = append(followings, following)
	}

	return followings, nil
}
