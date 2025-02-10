package repositories

import (
	"database/sql"

	"github.com/gofrs/uuid/v5"
)

type SessionsRepositorie struct {
	DB *sql.DB
}

func (s *SessionsRepositorie) DeleteSession(sessionID string) error {
	_, err := s.DB.Exec(`DELETE FROM sessions WHERE session_id = ?`)
	return err
}

func (s *SessionsRepositorie) CheckSession(sessionID string) bool {
	exist := 0
	query := `SELECT count(*) FROM sessions WHERE session_id = ?`
	err := s.DB.QueryRow(query, sessionID).Scan(&exist)
	if err != nil {
		return false
	}
	if exist == 1 {
		return true
	}
	return false
}

func (s *SessionsRepositorie) CreateSession(sessionID string, userID uuid.UUID) error {
	_, err := s.DB.Exec(`INSERT INTO sessions (session_id, user_id) VALUES (?, ?)`, sessionID, userID)
	return err
}

func (s *SessionsRepositorie) GetUserBySession(sessionID string) (string, error) {
	userId := ""
	if err := s.DB.QueryRow(`SELECT user_id FROM sessions WHERE session_id = ?`, sessionID).Scan(&userId); err != nil {
		return "", err
	}

	return userId, nil
}
