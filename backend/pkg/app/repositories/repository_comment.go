package repositories

import (
	"database/sql"
	"html"

	"blank/pkg/app/models"
)

type CommentRepositorie struct {
	DB *sql.DB
}

func (c *CommentRepositorie) Create(comment *models.Comment) error {
	query := "INSERT INTO comments (id, user_id, post_id, content) VALUES (?, ?, ?, ?)"
	prp, prepareErr := c.DB.Prepare(query)
	if prepareErr != nil {
		return prepareErr
	}
	defer prp.Close()
	comment.Content = html.EscapeString(comment.Content)
	_, execErr := prp.Exec(
		comment.ID,
		comment.UserID,
		comment.PostID,
		comment.Content,
	)
	if execErr != nil {
		return execErr
	}
	return nil
}

func (c *CommentRepositorie) CommentExist(commentID string) bool {
	var num int
	query := `SELECT COUNT(*) FROM comments WHERE id = ?`
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

func (c *CommentRepositorie) GetCommentByPost(postID string, pagination int) ([]models.CommentDetails, error) {
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
					l.comment_id = c.comment_id
			) AS LikeCount,
			u.user_id,
			u.first_name,
			u.last_name,
			u.avatar
		FROM
			Comment c
			JOIN User u ON c.user_id = u.user_id
		WHERE
			c.post_id = ?
		ORDER BY
			c.created_at DESC
		LIMIT 20
		OFFSET ?;`

	rows, queryErr := c.DB.Query(querySelect, postID, pagination)
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
			&comment.User.ID,
			&comment.User.FirstName,
			&comment.User.LastName,
			&comment.User.Avatar,
		)
		if scanErr != nil {
			return nil, scanErr
		}
		comment.FormattedDate = comment.CreatedAt.Format("01/02/2006, 3:04:05 PM")
		comments = append(comments, comment)
	}
	return comments, nil
}
