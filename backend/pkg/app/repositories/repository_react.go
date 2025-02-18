package repositories

import (
	"database/sql"

	"blank/pkg/app/models"

	"github.com/gofrs/uuid/v5"
)

type ReactReposetorie struct {
	DB *sql.DB
}

func (r *ReactReposetorie) CreateReact(react *models.Reacts, target string) error {
	var id *string
	var existingreactionID uuid.UUID
	if target == "post" {
		id = react.PostID
	} else {
		id = react.CommentID
	}
	row := r.DB.QueryRow("SELECT like_id FROM Like WHERE "+target+"_id = ?  AND user_id = ?", id, react.UserID)
	switch err := row.Scan(&existingreactionID); err {
	case sql.ErrNoRows:
		preparedQuery, err := r.DB.Prepare("INSERT INTO Like (like_id, user_id, post_id, comment_id) VALUES (?, ?, ?, ?)")
		if err != nil {
			return err
		}
		_, err = preparedQuery.Exec(react.ID, react.UserID, react.PostID, react.CommentID)
		if err != nil {
			return err
		}
		return nil
	case nil:
		preparedQuery, err := r.DB.Prepare("DELETE FROM Like WHERE like_id = ? AND user_id = ? ")
		if err != nil {
			return err
		}
		_, err = preparedQuery.Exec(existingreactionID, react.UserID)
		if err != nil {
			return err
		}
		return nil
	default:
		return err
	}
}

func (r *ReactReposetorie) GetReacts(Id, target string) (any, error) {
	var like int
	errcountlike := r.DB.QueryRow("SELECT COUNT(*) FROM Like WHERE "+target+"_id = ?", Id).Scan(&like)
	if errcountlike != nil {
		return nil, errcountlike
	}

	data := map[string]any{
		"id":        Id,
		"like_count": like,
	}
	return data, nil
}
