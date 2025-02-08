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
	 comments.id AS comment_id,
	 comments.content,
	 comments.created_at,
	 users.id AS user_id,
	 users.username,
	 (SELECT COUNT(*) FROM likes WHERE likes.comment_id = comments.id AND likes.react_type = 'like') AS LikeCount,
	 (SELECT COUNT(*) FROM likes WHERE likes.comment_id = comments.id AND likes.react_type = 'dislike') AS DisLikeCount,
	 COUNT(*) OVER() AS total_count
	FROM 
	 comments
	JOIN
	 users ON comments.user_id = users.id
	WHERE
	 comments.post_id = ?
	ORDER BY
	 comments.created_at DESC
	 LIMIT 5 OFFSET ?;`

	rows, queryErr := c.DB.Query(querySelect, postID, pagination)
	if queryErr != nil {
		return nil, queryErr
	}
	defer rows.Close()
	var comments []models.CommentDetails
	for rows.Next() {
		var currentComment models.CommentDetails
		scanErr := rows.Scan(
			&currentComment.CommentID,
			&currentComment.Content,
			&currentComment.CreatedAt,
			&currentComment.UserID,
			&currentComment.Username,
			&currentComment.LikeCount,
			&currentComment.DisLikeCount,
			&currentComment.TotalCount,
		)
		if scanErr != nil {
			return nil, scanErr
		}
		currentComment.FormattedDate = currentComment.CreatedAt.Format("01/02/2006, 3:04:05 PM")
		comments = append(comments, currentComment)
	}
	return comments, nil
}
