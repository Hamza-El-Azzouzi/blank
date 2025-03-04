package repositories

import (
	"database/sql"

	"blank/pkg/app/models"

	"github.com/gofrs/uuid/v5"
)

type UserRepository struct {
	DB *sql.DB
}

func (r *UserRepository) Create(user *models.User) error {
	query := `INSERT INTO User
		(user_id, first_name, last_name, email, password, date_of_birth, nickname, about_me, avatar, is_public)
		VALUES (?,?,?,?,?,?,?,?,?,?)`
	_, err := r.DB.Exec(query, user.ID, user.FirstName, user.LastName, user.Email,
		user.Password, user.DateOfBirth, user.Nickname, user.AboutMe, user.Avatar, user.IsPublic)
	if err != nil {
		return err
	}

	return nil
}

func (r *UserRepository) FindUser(identifier string, flag string) (*models.User, error) {
	user := &models.User{}
	query := ""
	switch true {
	case flag == "byId":
		query = `SELECT user_id, email, password FROM User WHERE id= ?`
	case flag == "byEmail":
		query = `SELECT user_id, email, password FROM User WHERE email= ?`
	}

	if err := r.DB.QueryRow(query, identifier).Scan(&user.ID, &user.Email, &user.Password); err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}
	return user, nil
}

func (r *UserRepository) GetUserBySessionID(sessionID string) (*models.User, error) {
	user := &models.User{}
	query := `SELECT users.id, users.username, users.email, users.password_hash
		FROM users 
		JOIN sessions ON users.id = sessions.user_id 
		WHERE sessions.session_id = ?`
	row := r.DB.QueryRow(query, sessionID)
	err := row.Scan(&user.ID, &user.Nickname, &user.Email, &user.Password)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}
	return user, nil
}

func (r *UserRepository) SearchUsers(searchQuery string, limit, offset int) ([]models.UserInfo, int, error) {
	users := []models.UserInfo{}
	var total int
	countQuery := "SELECT COUNT(*) FROM User WHERE first_name LIKE ? OR last_name LIKE ?"
	err := r.DB.QueryRow(countQuery, "%"+searchQuery+"%", "%"+searchQuery+"%").Scan(&total)
	if err != nil {
		return nil, 0, err
	}
	query := `
        SELECT user_id, first_name, last_name, avatar 
        FROM User 
        WHERE first_name LIKE ? OR last_name LIKE ?
        ORDER BY first_name, last_name
        LIMIT ? OFFSET ?
    `

	rows, err := r.DB.Query(query, "%"+searchQuery+"%", "%"+searchQuery+"%", limit, offset)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	for rows.Next() {
		user := models.UserInfo{}
		err := rows.Scan(&user.UserID, &user.FirstName, &user.LastName, &user.Avatar)
		if err != nil {
			return nil, 0, err
		}
		users = append(users, user)
	}

	return users, total, nil
}

func (r *UserRepository) GetAllUserInfo(user_id uuid.UUID) (*models.UserInfo, error) {
	user := &models.UserInfo{}
	query := `
	SELECT 
		u.first_name,
		u.last_name,
		u.email,
		u.date_of_birth,
		COALESCE(u.nickname, ""),
		COALESCE(u.about_me, ""),
		COALESCE(u.avatar, ""),
		u.is_public,
		(SELECT COUNT(*) FROM Follow WHERE follower_id = u.user_id AND status = 'accepted') AS following_count,
		(SELECT COUNT(*) FROM Follow WHERE following_id = u.user_id AND status = 'accepted') AS followers_count
	FROM User u
	LEFT JOIN Follow f ON u.user_id = f.follower_id OR u.user_id = f.following_id
	WHERE u.user_id = ?;
	`

	row := r.DB.QueryRow(query, user_id)
	err := row.Scan(&user.FirstName,
		&user.LastName,
		&user.Email,
		&user.DateOfBirth,
		&user.Nickname,
		&user.About,
		&user.Avatar,
		&user.IsPublic,
		&user.Following,
		&user.Followers)
	if err != nil {
		if err == sql.ErrNoRows {
			return &models.UserInfo{}, nil
		}
		return &models.UserInfo{}, err
	}
	return user, nil
}

func (r *UserRepository) GetPublicUserInfo(user_id uuid.UUID) (*models.UserInfo, error) {
	user := &models.UserInfo{}
	query := `
	SELECT 
		u.first_name,
		u.last_name,
		COALESCE(u.avatar, ""),
		u.is_public,
		(SELECT COUNT(*) FROM Follow WHERE follower_id = u.user_id AND status = 'accepted') AS following_count,
		(SELECT COUNT(*) FROM Follow WHERE following_id = u.user_id AND status = 'accepted') AS followers_count
	FROM User u
	LEFT JOIN Follow f ON u.user_id = f.follower_id OR u.user_id = f.following_id
	WHERE u.user_id = ?;
	`

	row := r.DB.QueryRow(query, user_id)
	err := row.Scan(
		&user.FirstName,
		&user.LastName,
		&user.Avatar,
		&user.IsPublic,
		&user.Following,
		&user.Followers,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return &models.UserInfo{}, nil
		}
		return &models.UserInfo{}, err
	}
	return user, nil
}

func nullIfEmpty(value string) sql.NullString {
	if value == "" {
		return sql.NullString{Valid: false}
	}
	return sql.NullString{String: value, Valid: true}
}

func (r *UserRepository) UpdateUserInfo(user_id uuid.UUID, userInfo models.UserInfo) error {
	query := `
		UPDATE User 
		SET 
			first_name = ?,
			last_name = ?,
			email = ?,
			nickname = ?,
			about_me = ?,
			date_of_birth = ?,
			is_public = ?
		WHERE 
			user_id = ?`

	stm, err := r.DB.Prepare(query)
	if err != nil {
		return err
	}
	defer stm.Close()

	_, err = stm.Exec(
		userInfo.FirstName,
		userInfo.LastName,
		userInfo.Email,
		nullIfEmpty(userInfo.Nickname),
		nullIfEmpty(userInfo.About),
		userInfo.DateOfBirth,
		userInfo.IsPublic,
		user_id,
	)
	if err != nil {
		return err
	}

	return nil
}

func (r *UserRepository) SaveAvatar(userID uuid.UUID, filename string) error {
	query := `
		UPDATE User 
		SET 
			avatar = ?
		WHERE 
			user_id = ?`

	stm, err := r.DB.Prepare(query)
	if err != nil {
		return err
	}
	defer stm.Close()

	_, err = r.DB.Exec(query, filename, userID)
	if err != nil {
		return err
	}

	return nil
}

func (u *UserRepository) UserExist(userID uuid.UUID) bool {
	var num int
	query := `SELECT COUNT(*) FROM User WHERE user_id = ?`
	row := u.DB.QueryRow(query, userID)
	err := row.Scan(&num)
	if err != nil {
		return false
	}
	if num == 1 {
		return true
	}
	return false
}

func (u *UserRepository) IsProfilePublic(userID string) bool {
	isPublic := false
	query := `SELECT is_public FROM User WHERE user_id = ?`
	row := u.DB.QueryRow(query, userID)
	row.Scan(&isPublic)
	return isPublic
}

func (u *UserRepository) GetUserPrivacy(userID uuid.UUID) (bool, error) {
	var isPublic bool
	query := `SELECT is_public FROM User WHERE user_id = ?`
	err := u.DB.QueryRow(query, userID).Scan(&isPublic)
	if err != nil {
		return false, err
	}

	return isPublic, nil
}

func (u *UserRepository) IsFollowing(authUserID, userID uuid.UUID) (bool, error) {
	isFollowing := false
	query := `
		SELECT
			EXISTS (
				SELECT
					1
				FROM
					Follow f
				WHERE
					f.follower_id = ?
					AND f.following_id = ?
					AND f.status = "accepted"
			) AS is_following
	`

	err := u.DB.QueryRow(query, authUserID, userID).Scan(&isFollowing)
	if err != nil {
		return isFollowing, err
	}

	return isFollowing, nil
}

func (u *UserRepository) CheckFollowRequestPending(followingID, followerID uuid.UUID) (bool, error) {
	isPending := false
	query := `
		SELECT
			EXISTS (
				SELECT
					1
				FROM
					Follow f
				WHERE
					f.follower_id = ?
					AND f.following_id = ?
					AND f.status = "pending"
			) AS is_pending
	`

	err := u.DB.QueryRow(query, followerID, followingID).Scan(&isPending)
	if err != nil {
		return false, err
	}

	return isPending, nil
}
