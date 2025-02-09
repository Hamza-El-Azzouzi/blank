package repositories

import (
	"database/sql"
	"time"

	"github.com/gofrs/uuid/v5"
)

type SessionsRepositorie struct {
	DB *sql.DB
}

func (s *SessionsRepositorie) DeletSession(sessionID string) error {
	preparedQuery, err := s.DB.Prepare(`DELETE FROM sessions WHERE session_id = ?`)
	if err != nil {
		return nil
	}

	_, err = preparedQuery.Exec(sessionID)
	return err
}

func (s *SessionsRepositorie) CheckSession(sessionId string) bool {
	exist := 0
	query := `SELECT count(*) FROM sessions WHERE session_id = ?`
	row := s.DB.QueryRow(query, sessionId)
	err := row.Scan(&exist)
	if err != nil {
		return false
	}
	if exist == 1 {
		return true
	}
	return false
}

func (s *SessionsRepositorie) Createession(sessionID string, expiration time.Time, userID uuid.UUID) error {
	preparedQuery, err := s.DB.Prepare(`INSERT INTO sessions (session_id, user_id, expires_at) VALUES (?, ?, ?)`)
	if err != nil {
		return nil
	}
	_, err = preparedQuery.Exec(sessionID, userID, expiration)
	return err
}

func (s *SessionsRepositorie) UpdateSession(sessionID string, expiration time.Time, userID uuid.UUID) error {
	preparedQuery, err := s.DB.Prepare(`UPDATE sessions SET session_id= ?, expires_at=? WHERE user_id= ?`)
	if err != nil {
		return nil
	}
	_, err = preparedQuery.Exec(sessionID, expiration, userID)
	return err
}

func (s *SessionsRepositorie) DeleteSessionByDate(time time.Time) error {
	preparedQuery, err := s.DB.Prepare(`DELETE FROM sessions WHERE expires_at < ?`)
	if err != nil {
		return nil
	}
	_, err = preparedQuery.Exec(time)
	return err
}

func (s *SessionsRepositorie) GetUser(sessionID string) (string, error) {
	userId := ""
	if err := s.DB.QueryRow(`SELECT user_id FROM sessions WHERE session_id = ?`, sessionID).Scan(&userId); err != nil {
		return "", err
	}

	return userId, nil
}

func (s *SessionsRepositorie) CheckUserAlreadyLogged(UserID uuid.UUID) error {
	var sessionID string
	query := `SELECT session_id FROM sessions WHERE  user_id = ?`
	row := s.DB.QueryRow(query, UserID)
	err := row.Scan(&sessionID)
	if err != nil {
		return err
	}
	return nil
}
