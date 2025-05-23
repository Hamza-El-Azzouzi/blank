package repositories

import (
	"database/sql"
	"fmt"

	"blank/pkg/app/models"

	"github.com/gofrs/uuid/v5"
)

type PostRepository struct {
	DB *sql.DB
}

func (r *PostRepository) Create(post *models.Post) error {
	preparedQuery, err := r.DB.Prepare("INSERT INTO Post (post_id, user_id, content, image, privacy_level) VALUES (?, ?, ?, ?, ?)")
	if err != nil {
		return err
	}
	_, err = preparedQuery.Exec(post.ID, post.UserID, post.Content, post.Image, post.Privacy)
	return err
}

func (r *PostRepository) AllPosts(pagination int, currentUserID uuid.UUID) ([]models.PostWithUser, error) {
	query := `SELECT 
		Post.post_id,
		Post.content,
		Post.image,
		Post.created_at,
		Post.privacy_level,
		User.user_id,
		User.first_name,
		User.last_name,
		User.avatar,
		CASE
			WHEN comment_counts.comment_count > 100 THEN '+100'
			ELSE COALESCE(CAST(comment_counts.comment_count AS TEXT), '0')
		END AS comment_count,
		(SELECT COUNT(*) FROM Like WHERE Like.post_id = Post.post_id) AS like_count,
		EXISTS(SELECT 1 FROM Like WHERE Like.post_id = Post.post_id AND Like.user_id = ?) AS has_liked,
		COUNT(*) OVER() AS total_count
	FROM 
		Post
	JOIN 
		User ON Post.user_id = User.user_id
	LEFT JOIN 
		(SELECT post_id, COUNT(*) AS comment_count FROM Comment GROUP BY post_id) AS comment_counts
		ON Post.post_id = comment_counts.post_id
	WHERE
		(Post.privacy_level = 'public' AND User.is_public = 1)
		OR ((Post.privacy_level = 'almost private' OR Post.privacy_level = 'public') AND EXISTS(SELECT 1 FROM Follow WHERE Follow.follower_id = ? AND Follow.following_id = Post.user_id AND status = 'accepted'))
		OR (Post.privacy_level = 'private' AND EXISTS(SELECT 1 FROM Post_Privacy WHERE Post_Privacy.post_id = Post.post_id AND Post_Privacy.user_id = ?))
		OR (Post.user_id = ?)
	GROUP BY 
		Post.post_id
	ORDER BY 
		Post.created_at DESC 
	LIMIT 20 OFFSET ?;`
	rows, err := r.DB.Query(query, currentUserID, currentUserID, currentUserID, currentUserID, pagination)
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
			&post.Privacy,
			&post.UserID,
			&post.FirstName,
			&post.LastName,
			&post.Avatar,
			&post.CommentCount,
			&post.LikeCount,
			&post.HasLiked,
			&post.TotalCount,
		)
		if err != nil {
			return nil, fmt.Errorf("error scanning post with user info: %v", err)
		}
		post.FormattedDate = post.CreatedAt.Format("01/02/2006, 3:04:05 PM")
		post.Author = post.FirstName + " " + post.LastName
		posts = append(posts, post)
	}
	err = rows.Err()
	if err != nil {
		return nil, fmt.Errorf("error iterating posts with user info: %v", err)
	}

	return posts, nil
}

func (r *PostRepository) PostsByUser(userID, authUserID uuid.UUID, pagination int) ([]models.PostByUser, error) {
	query := `
		SELECT
			p.post_id,
			p.content,
			p.image,
			p.created_at,
			p.privacy_level,
			(SELECT COUNT(*) FROM Like WHERE Like.post_id = p.post_id) AS like_count,
			(SELECT COUNT(*) FROM Comment c WHERE c.post_id = p.post_id) AS comments_count,
			EXISTS(SELECT 1 FROM Like WHERE Like.post_id = p.post_id AND Like.user_id = ?) AS has_liked,
			p.user_id
		FROM
			Post p
			JOIN User u ON p.user_id = u.user_id
		WHERE
			p.user_id = ? AND (
				? = ? OR
				(p.privacy_level = 'public') OR
				(p.privacy_level = 'almost private' AND EXISTS(
					SELECT 1 FROM Follow WHERE Follow.follower_id = ? AND Follow.following_id = p.user_id AND status = 'accepted'
				)) OR
				(p.privacy_level = 'private' AND EXISTS(
					SELECT 1 FROM Post_Privacy WHERE Post_Privacy.post_id = p.post_id AND Post_Privacy.user_id = ?
				))
			)
		GROUP BY
			p.post_id
		ORDER BY
			p.created_at DESC
		LIMIT 20 OFFSET ?;
	`
	rows, err := r.DB.Query(query, authUserID, userID, authUserID, userID, authUserID, authUserID, pagination)
	if err != nil {
		return nil, fmt.Errorf("error querying posts with user info: %v", err)
	}
	defer rows.Close()

	var posts []models.PostByUser
	for rows.Next() {
		var post models.PostByUser
		err = rows.Scan(
			&post.ID,
			&post.Content,
			&post.Image,
			&post.CreatedAt,
			&post.Privacy,
			&post.LikeCount,
			&post.CommentCount,
			&post.HasLiked,
			&post.UserID,
		)
		if err != nil {
			return nil, fmt.Errorf("error scanning post with user info: %v", err)
		}
		post.FormattedDate = post.CreatedAt.Format("01/02/2006, 3:04 PM")
		posts = append(posts, post)
	}
	if err = rows.Err(); err != nil {
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

func (r *PostRepository) PostPrivacy(postID uuid.UUID, userID string) error {
	preparedQuery, err := r.DB.Prepare("INSERT INTO Post_Privacy (post_id, user_id) VALUES (?, ?)")
	if err != nil {
		return err
	}
	_, err = preparedQuery.Exec(postID, userID)
	return err
}
