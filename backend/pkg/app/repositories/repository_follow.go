package repositories

import (
	"database/sql"

	"blank/pkg/app/models"
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

func (f *FollowRepositorie) GetFollowers(userId string, offset int) (*models.FollowListResponse, error) {
	query := `
        SELECT 
            u.user_id,
            u.first_name,
            u.last_name,
            u.avatar,
            COUNT(*) OVER() as total_count
        FROM Follow f
        JOIN User u ON f.follower_id = u.user_id
        WHERE f.following_id = ? AND f.status = "accepted"
        ORDER BY u.first_name ASC
        LIMIT 20 OFFSET ?`

	rows, err := f.DB.Query(query, userId, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var response models.FollowListResponse
	var followers []models.FollowList
	var totalCount int

	for rows.Next() {
		var follower models.FollowList
		err := rows.Scan(&follower.UserId, &follower.FirstName, &follower.LastName, &follower.Avatar, &totalCount)
		if err != nil {
			return nil, err
		}
		followers = append(followers, follower)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	response.FollowList = followers
	response.TotalCount = totalCount
	return &response, nil
}

func (f *FollowRepositorie) GetFollowing(userId string, offset int) (*models.FollowListResponse, error) {
	query := `
        SELECT 
            u.user_id,
            u.first_name,
            u.last_name,
            u.avatar,
            COUNT(*) OVER() as total_count
        FROM Follow f
        JOIN User u ON f.following_id = u.user_id
        WHERE f.follower_id = ? AND f.status = "accepted"
        ORDER BY u.first_name ASC
        LIMIT 20 OFFSET ?`

	rows, err := f.DB.Query(query, userId, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var response models.FollowListResponse
	var following []models.FollowList
	var totalCount int

	for rows.Next() {
		var follower models.FollowList
		err := rows.Scan(&follower.UserId, &follower.FirstName, &follower.LastName, &follower.Avatar, &totalCount)
		if err != nil {
			return nil, err
		}
		following = append(following, follower)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	response.FollowList = following
	response.TotalCount = totalCount
	return &response, nil
}

func (f *FollowRepositorie) DeleteFollowing(followData models.FollowRequest) (int, string) {
	query := `DELETE FROM Follow 
              WHERE follower_id = ? AND following_id = ?`
	result, err := f.DB.Exec(query, followData.FollowerId, followData.FollowingId)
	if err != nil {
		return 500, "error exec query: delete following"
	}

	rows, err := result.RowsAffected()
	if err != nil {
		return 500, "internal server error in deletingFollowing db"
	}
	if rows == 0 {
		return 400, "user not following the other user"
	}

	return 200, "success"
}

func (f *FollowRepositorie) DeleteFollower(followData models.FollowRequest) (int, string) {
    query := `DELETE FROM Follow 
              WHERE follower_id = ? AND following_id = ?`
    result, err := f.DB.Exec(query, followData.FollowerId, followData.FollowingId)
    if err != nil {
        return 500, "error exec query: delete follower"
    }

    rows, err := result.RowsAffected()
    if err != nil {
        return 500, "internal server error in deletingFollower db"
    }
    if rows == 0 {
        return 400, "user is not your follower"
    }

    return 200, "success"
}

func (f *FollowRepositorie) IsUserExists(userID string) bool {
	var exists bool
	query := "SELECT EXISTS(SELECT 1 FROM User WHERE user_id = ?)"
	err := f.DB.QueryRow(query, userID).Scan(&exists)
	if err != nil {
		return false
	}
	return exists
}
