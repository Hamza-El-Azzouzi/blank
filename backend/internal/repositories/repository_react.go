package repositories

import (
	"database/sql"

	"real-time-forum/internal/models"

	"github.com/gofrs/uuid/v5"
)

type ReactReposetorie struct {
	DB *sql.DB
}

func (r *ReactReposetorie) CreateReact(react *models.Reacts, target string) error {
	var id *string
	var existingreactionID uuid.UUID
	var reaction string
	if target == "post" {
		id = react.PostID
	} else {
		id = react.CommentID
	}
	row := r.DB.QueryRow("SELECT id, react_type FROM likes WHERE "+target+"_id = ?  AND user_id = ?", id, react.UserID)
	switch err := row.Scan(&existingreactionID, &reaction); err {
	case sql.ErrNoRows:
	case nil:
		if reaction == react.ReactType {
			preparedQuery, err := r.DB.Prepare("DELETE FROM likes WHERE id = ? AND user_id = ? ")
			if err != nil {
				return err
			}
			_, err = preparedQuery.Exec(existingreactionID, react.UserID)
			if err != nil {
				return err
			}
			return nil
		} else {
			preparedQuery, err := r.DB.Prepare("UPDATE likes SET react_type = ? WHERE id = ?")
			if err != nil {
				return err
			}
			_, err = preparedQuery.Exec(react.ReactType, existingreactionID)
			if err != nil {
				return err
			}
			return nil
		}
	default:
		return err
	}
	preparedQuery, err := r.DB.Prepare("INSERT INTO likes (id, user_id, post_id, comment_id, react_type) VALUES (?, ?, ?, ?, ?)")
	if err != nil {
		return err
	}
	_, err = preparedQuery.Exec(react.ID, react.UserID, react.PostID, react.CommentID, react.ReactType)
	if err != nil {
		return err
	}

	return nil
}

func (r *ReactReposetorie) GetReacts(Id, target string) (any, error) {
	var like int
	var dislike int
	errcountlike := r.DB.QueryRow("SELECT COUNT(*) FROM likes WHERE "+target+"_id = ? AND react_type = 'like'", Id).Scan(&like)
	if errcountlike != nil {
		return nil, errcountlike
	}
	errcountdislike := r.DB.QueryRow("SELECT COUNT(*) FROM likes WHERE "+target+"_id = ? AND react_type = 'dislike'", Id).Scan(&dislike)
	if errcountdislike != nil {
		return nil, errcountdislike
	}

	data := map[string]any{
		"id":           Id,
		"likeCount":    like,
		"dislikeCount": dislike,
	}
	return data, nil
}
