package repositories

import (
	"database/sql"
	"fmt"
	"html"

	"blank/pkg/app/models"
)

type PostRepository struct {
	DB *sql.DB
}

func (r *PostRepository) Create(post *models.Post) error {
	post.Content = html.EscapeString(post.Content)
	preparedQuery, err := r.DB.Prepare("INSERT INTO Post (post_id, user_id, content, image, privacy_level) VALUES (?, ?, ?, ?, ?)")
	if err != nil {
		return err
	}
	_, err = preparedQuery.Exec(post.ID, post.UserID, post.Content)
	return err
}

func (r *PostRepository) AllPosts(pagination int) ([]models.PostWithUser, error) {
	query := `SELECT 
		Post.post_id,
		Post.content,
		Post.image,
		Post.created_at,
		User.user_id,
		User.first_name,
		User.last_name,
		CASE
   			WHEN comment_counts.comment_count > 100 THEN '+100'
    		ELSE IFNULL(CAST(comment_counts.comment_count AS TEXT), '0')
		END AS comment_count,
		(SELECT COUNT(*) FROM Like WHERE Like.post_id = posts.id) AS like_count,
		COUNT(*) OVER() AS total_count
		FROM 
   			Post
		JOIN 
			User ON Post.user_id = User.user_id
		LEFT JOIN 
			(SELECT post_id, COUNT(*) AS comment_count FROM Comment GROUP BY post_id) AS comment_count
			ON Post.post_id = comment_count.post_id
		GROUP BY 
			Post.post_id
		ORDER BY 
			Post.created_at DESC 
		LIMIT 20 OFFSET ?;`
	rows, err := r.DB.Query(query, pagination)
	if err != nil {
		return nil, fmt.Errorf("error querying posts with user info: %v", err)
	}
	defer rows.Close()

	var posts []models.PostWithUser
	for rows.Next() {
		var post models.PostWithUser
		err = rows.Scan(
			&post.PostID,
			&post.Content,
			&post.Image,
			&post.CreatedAt,
			&post.UserID,
			&post.Username,
			&post.CommentCount,
			&post.LikeCount,
			&post.TotalCount,
		)
		if err != nil {
			return nil, fmt.Errorf("error scanning post with user info: %v", err)
		}
		post.FormattedDate = post.CreatedAt.Format("01/02/2006, 3:04:05 PM")
		posts = append(posts, post)
	}
	err = rows.Err()
	if err != nil {
		return nil, fmt.Errorf("error iterating posts with user info: %v", err)
	}

	return posts, nil
}

func (r *PostRepository) PostExist(postID string) bool {
	var num int
	query := `SELECT COUNT(*) FROM Post WHERE post_id = ?`
	row := r.DB.QueryRow(query, postID)
	err := row.Scan(&num)
	if err != nil {
		return false
	}
	if num == 1 {
		return true
	}
	return false
}
