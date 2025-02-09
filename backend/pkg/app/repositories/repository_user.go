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
		query = `SELECT id, username, email, password FROM users WHERE id= ?`
	case flag == "byEmail":
		query = `SELECT id, username, email, password FROM users WHERE email= ?`
	}

	if err := r.DB.QueryRow(query, identifier).Scan(&user.ID, &user.Nickname, &user.Email, &user.Password); err != nil {
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

			err := rows.Scan(&user.ID, &user.Nickname, &user.FirstName, &user.LastName)
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

			err := rows.Scan(&user.ID, &user.Nickname, &user.FirstName, &user.LastName)
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
		err := rows.Scan(&user.ID, &user.Nickname, &user.FirstName, &user.LastName)
		if err != nil {
			return nil, err
		}
		users = append(users, user)
	}
	return users, nil
}
