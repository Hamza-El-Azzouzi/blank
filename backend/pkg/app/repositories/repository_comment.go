package repositories

import (
	"database/sql"
	"html"

	"blank/pkg/app/models"

	"github.com/gofrs/uuid/v5"
)

type CommentRepositorie struct {
	DB *sql.DB
}

func (c *CommentRepositorie) Create(comment *models.Comment) error {
	query := `INSERT INTO Comment (comment_id, user_id, commentable_id,commentable_type,content) VALUES (?, ?, ?, ?,?)`
	prp, err := c.DB.Prepare(query)
	if err != nil {
		return err
	}
	defer prp.Close()
	_, err = prp.Exec(
		comment.ID,
		comment.UserID,
		comment.Commentable_id,
		comment.Target,
		comment.Content,
	)
	if err != nil {
		return err
	}
	return nil
}

func (c *CommentRepositorie) CommentExist(commentID string) bool {
	var num int
	query := `SELECT COUNT(*) FROM Comment WHERE comment_id = ?`
	row := c.DB.QueryRow(query, commentID)
	err := row.Scan(&num)
	if err != nil {
		return false
	}
	if num == 1 {
		return true
	}
	return false
}

func (c *CommentRepositorie) GetCommentByPost(userID uuid.UUID, postID, target string, offset, limit int) ([]models.CommentDetails, error) {
	querySelect := `
		SELECT
			c.comment_id,
			c.content,
			c.created_at,
			(
				SELECT
					COUNT(like_id)
				FROM
					Like l
				WHERE
					l.likeable_id = c.comment_id AND l.likeable_type = ?
			) AS LikeCount,
			EXISTS(SELECT 1 FROM Like l WHERE l.likeable_id = c.comment_id AND l.user_id = ? AND l.likeable_type = ?) AS has_liked,
			u.first_name,
			u.last_name,
			u.avatar,
			u.user_id
		FROM
			Comment c
			JOIN User u ON c.user_id = u.user_id
		WHERE
			c.commentable_id = ? AND c.commentable_type = ?
		ORDER BY
			c.created_at DESC
		LIMIT ?
		OFFSET ?;`

	rows, queryErr := c.DB.Query(querySelect, target, userID, target, postID, target, limit, offset)
	if queryErr != nil {
		return nil, queryErr
	}
	defer rows.Close()
	var comments []models.CommentDetails
	for rows.Next() {
		var comment models.CommentDetails
		scanErr := rows.Scan(
			&comment.CommentID,
			&comment.Content,
			&comment.CreatedAt,
			&comment.LikeCount,
			&comment.HasLiked,
			&comment.User.FirstName,
			&comment.User.LastName,
			&comment.User.Avatar,
			&comment.User.UserID,
		)
		if scanErr != nil {
			return nil, scanErr
		}
		comment.FormattedDate = comment.CreatedAt.Format("01/02/2006, 3:04:05 PM")
		comment.Content = html.UnescapeString(comment.Content)
		comments = append(comments, comment)
	}
	return comments, nil
}

func (c *CommentRepositorie) CheckLike(user_id uuid.UUID, commentID,target string) (string, error) {
	query := `SELECT like_id FROM LIKE WHERE user_id = ? AND likeable_id = ? AND likeable_type = ?`
	prp, err := c.DB.Prepare(query)
	if err != nil {
		return "", err
	}
	defer prp.Close()
	var like_id string
	err = prp.QueryRow(user_id, commentID,target).Scan(&like_id)
	if err != nil {
		return "", err
	}
	return like_id, nil
}

func (c *CommentRepositorie) LikeComment(likeID, user_id uuid.UUID, commentID,target string) error {
	query := `INSERT INTO Like (like_id, user_id, likeable_id,likeable_type) VALUES (?,?,?,?)`
	prp, err := c.DB.Prepare(query)
	if err != nil {
		return err
	}
	defer prp.Close()

	_, err = prp.Exec(
		likeID,
		user_id,
		commentID,
		target,
	)
	if err != nil {
		return err
	}
	return nil
}

func (c *CommentRepositorie) RemoveLike(likeID string) error {
	query := `DELETE FROM Like WHERE like_id = ?`
	prp, err := c.DB.Prepare(query)
	if err != nil {
		return err
	}
	defer prp.Close()

	_, err = prp.Exec(likeID)
	if err != nil {
		return err
	}
	return nil
}
