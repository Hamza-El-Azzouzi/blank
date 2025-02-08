package repositories

import (
	"database/sql"
	"fmt"
	"html"

	"real-time-forum/internal/models"
)

type PostRepository struct {
	DB *sql.DB
}

func (r *PostRepository) Create(post *models.Post) error {
	post.Content = html.EscapeString(post.Content)
	post.Title = html.EscapeString(post.Title)
	preparedQuery, err := r.DB.Prepare("INSERT INTO posts (ID, user_id, Title, Content) VALUES (?, ?, ?, ?)")
	if err != nil {
		return err
	}
	_, err = preparedQuery.Exec(post.ID, post.UserID, post.Title, post.Content)
	return err
}

func (r *PostRepository) PostCatgorie(postCategorie *models.PostCategory) error {
	preparedQuery, err := r.DB.Prepare("INSERT INTO post_categories (post_id, category_id) VALUES (?, ?)")
	if err != nil {
		return err
	}
	_, err = preparedQuery.Exec(postCategorie.PostID, postCategorie.CategoryID)
	return err
}

func (r *PostRepository) AllPosts(pagination int) ([]models.PostWithUser, error) {
	query := `SELECT 
		posts.id AS post_id,
		posts.title,
		posts.content,
		posts.created_at,
		users.id AS user_id,
		users.username,
		REPLACE(IFNULL(GROUP_CONCAT(DISTINCT categories.name), ''), ',', ' | ') AS category_names,
		CASE
   			WHEN comment_counts.comment_count > 100 THEN '+100'
    		ELSE IFNULL(CAST(comment_counts.comment_count AS TEXT), '0')
		END AS comment_count,
		(SELECT COUNT(*) FROM likes WHERE likes.post_id = posts.id AND likes.react_type = "like") AS likes_count,
		(SELECT COUNT(*) FROM likes WHERE likes.post_id = posts.id AND likes.react_type = "dislike") AS dislike_count,
		COUNT(*) OVER() AS total_count
		FROM 
   			posts
		JOIN 
			users ON posts.user_id = users.id
		LEFT JOIN 
			post_categories ON posts.id = post_categories.post_id
		LEFT JOIN 
			categories ON post_categories.category_id = categories.id
		LEFT JOIN 
			(SELECT post_id, COUNT(*) AS comment_count FROM comments GROUP BY post_id) AS comment_counts
			ON posts.id = comment_counts.post_id
		GROUP BY 
			posts.id
		ORDER BY 
			posts.created_at DESC 
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
			&post.Title,
			&post.Content,
			&post.CreatedAt,
			&post.UserID,
			&post.Username,
			&post.CategoryName,
			&post.CommentCount,
			&post.LikeCount,
			&post.DisLikeCount,
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
	query := `SELECT COUNT(*) FROM posts WHERE id = ?`
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
