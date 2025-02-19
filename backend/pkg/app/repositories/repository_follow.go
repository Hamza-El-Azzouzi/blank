package repositories

import (
	"blank/pkg/app/models"
	"database/sql"
)

type FollowRepositorie struct {
	DB *sql.DB
}

func (f *FollowRepositorie) GetFollowers(userId string, offset int) (*models.FollowerResponse, error) {
	query := `
        SELECT 
            u.user_id,
            u.first_name,
            u.last_name,
            u.avatar,
            COUNT(*) OVER() as total_count
        FROM Follow f
        JOIN User u ON f.follower_id = u.user_id
        WHERE f.following_id = ?
        ORDER BY u.first_name ASC
        LIMIT 20 OFFSET ?`

	rows, err := f.DB.Query(query, userId, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var response models.FollowerResponse
	var followers []models.FollowerList
	var totalCount int

	for rows.Next() {
		var follower models.FollowerList
		err := rows.Scan(
			&follower.UserId,
			&follower.FirstName,
			&follower.LastName,
			&follower.Avatar,
			&totalCount)
		if err != nil {
			return nil, err
		}
		followers = append(followers, follower)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	response.Followers = followers
	response.TotalCount = totalCount
	return &response, nil
}
