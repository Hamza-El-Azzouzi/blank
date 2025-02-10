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
	preparedQuery, err := r.DB.Prepare(`INSERT INTO users (id, username,age,gender,first_name,last_name, email, password_hash) VALUES (?, ?,?,?,?,?, ?, ?)`)
	if err != nil {
		return err
	}
	_, err = preparedQuery.Exec(user.ID, user.Username, user.Age, user.Gender, user.FirstName, user.LastName, user.Email, user.PasswordHash)
	return err
}

func (r *UserRepository) FindUser(identifier string, flag string) (*models.User, error) {
	user := &models.User{}
	query := ""
	switch true {
	case flag == "byId":
		query = `SELECT id, username, email, password_hash FROM users WHERE id= ?`
	case flag == "byEmail":
		query = `SELECT id, username, email, password_hash FROM users WHERE email= ?`
	case flag == "byUserName":
		query = `SELECT id, username, email, password_hash FROM users WHERE username= ?`
	}

	row := r.DB.QueryRow(query, identifier)
	err := row.Scan(&user.ID, &user.Username, &user.Email, &user.PasswordHash)
	if err != nil {
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
	err := row.Scan(&user.ID, &user.Username, &user.Email, &user.PasswordHash)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}
	return user, nil
}

func (r *UserRepository) GetUsers(userId uuid.UUID, isNew bool, nPagination int) ([]models.User, error) {
	allUser := []models.User{}
	if isNew {
		query := `SELECT id, username , first_name, last_name FROM users WHERE id != ? ORDER BY LOWER(username) ASC LIMIT 20 OFFSET ?`
		rows, err := r.DB.Query(query, userId, nPagination)
		if err != nil {

			if err == sql.ErrNoRows {
				return nil, nil
			}
			return nil, err
		}
		for rows.Next() {
			user := models.User{}

			err := rows.Scan(&user.ID, &user.Username, &user.FirstName, &user.LastName)
			if err != nil {
				return nil, err
			}
			allUser = append(allUser, user)
		}
	} else if !isNew {
		query := `
		SELECT 
			u.id AS user_id,
			u.username,
			u.first_name,
			u.last_name
		FROM 
			users u
		LEFT JOIN 
			messages m ON (m.user_id_sender = u.id OR m.user_id_receiver = u.id)
			AND (m.user_id_sender = ? OR m.user_id_receiver = ?)
		WHERE 
			u.id != ?
		GROUP BY 
			u.id
		ORDER BY  
    		MAX(m.created_at) DESC NULLS LAST, 
    		MAX(CASE WHEN m.un_readed = 1 THEN 1 ELSE 0 END) DESC,
			u.username ASC
		LIMIT 20 OFFSET ?;
		`
		rows, err := r.DB.Query(query, userId, userId, userId, nPagination)
		if err != nil {

			if err == sql.ErrNoRows {
				return nil, nil
			}
			return nil, err
		}
		for rows.Next() {
			user := models.User{}

			err := rows.Scan(&user.ID, &user.Username, &user.FirstName, &user.LastName)
			if err != nil {
				return nil, err
			}
			allUser = append(allUser, user)
		}

	}
	return allUser, nil
}

func (r *UserRepository) GetUserByUserName(userName string, user_id uuid.UUID) ([]models.User, error) {
	users := []models.User{}
	query := "SELECT id, username , first_name, last_name FROM users WHERE username LIKE ? AND id != ?"

	rows, err := r.DB.Query(query, "%"+userName+"%", user_id)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}
	for rows.Next() {
		user := models.User{}
		err := rows.Scan(&user.ID, &user.Username, &user.FirstName, &user.LastName)
		if err != nil {
			return nil, err
		}
		users = append(users, user)
	}
	return users, nil
}

func (r *UserRepository) GetUserInfo(user_id uuid.UUID) (*models.UserInfo, error) {
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
		(SELECT COUNT(*) FROM Follow WHERE followed_id = u.user_id AND status = 'accepted') AS followers_count
	FROM User u
	LEFT JOIN Follow f ON u.user_id = f.follower_id OR u.user_id = f.followed_id
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

// Helper function to return sql.NullString
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
