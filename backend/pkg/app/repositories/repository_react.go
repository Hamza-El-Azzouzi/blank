package repositories

import (
	"database/sql"
	"fmt"

	"blank/pkg/app/models"

	"github.com/gofrs/uuid/v5"
)

type ReactReposetorie struct {
	DB *sql.DB
}

func (r *ReactReposetorie) CreateReact(react *models.Reacts, target string) error {
	var existingreactionID uuid.UUID
	var row *sql.Row
	switch target {
	case "Post":
		row = r.DB.QueryRow("SELECT like_id FROM Like WHERE post_id = ? AND user_id = ?", react.Post_id, react.UserID)
	case "Group_Post":
		row = r.DB.QueryRow("SELECT like_id FROM Like WHERE group_post_id = ? AND user_id = ?", react.Group_Post_id, react.UserID)
	case "Comment":
		row = r.DB.QueryRow("SELECT like_id FROM Like WHERE comment_id = ? AND user_id = ?", react.Comment_id, react.UserID)
	default:
		return fmt.Errorf("invalid target type: %s", target)
	}
	err := row.Scan(&existingreactionID); 
	switch err {
		
	case sql.ErrNoRows:
		preparedQuery, err := r.DB.Prepare("INSERT INTO Like (like_id, user_id, comment_id, post_id,group_post_id) VALUES (?, ?, ?, ?,?)")
		if err != nil {
			return err
		}
		_, err = preparedQuery.Exec(react.ID, react.UserID, react.Comment_id,react.Post_id,react.Group_Post_id)
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
	var err error

	switch target {
	case "Post":
		err = r.DB.QueryRow("SELECT COUNT(*) FROM Like WHERE post_id = ?", Id).Scan(&like)
	case "Group_Post":
		err = r.DB.QueryRow("SELECT COUNT(*) FROM Like WHERE group_post_id = ?", Id).Scan(&like)
	case "Comment":
		err = r.DB.QueryRow("SELECT COUNT(*) FROM Like WHERE comment_id = ?", Id).Scan(&like)
	default:
		return nil, fmt.Errorf("invalid target type: %s", target)
	}

	if err != nil {
		return nil, err
	}

	data := map[string]any{
		"id":         Id,
		"like_count": like,
	}
	return data, nil
}
