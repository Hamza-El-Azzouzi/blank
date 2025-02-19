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
