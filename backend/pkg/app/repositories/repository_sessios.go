package repositories

import (
	"database/sql"

	"github.com/gofrs/uuid/v5"
)

type SessionsRepositorie struct {
	DB *sql.DB
}

func (s *SessionsRepositorie) DeleteSession(sessionID string) error {
	_, err := s.DB.Exec(`DELETE FROM Session WHERE session_id = ?`,sessionID)
	return err
}

func (s *SessionsRepositorie) CheckSession(sessionID string) (string,bool) {
	exist := 0
	user_id := ""
	query := `SELECT user_id,count(*) FROM Session WHERE session_id = ?`
	err := s.DB.QueryRow(query, sessionID).Scan(&user_id,&exist)
	if err != nil {
		return user_id,false
	}
	if exist == 1 {
		return user_id,true
	}
	return user_id,false
}

func (s *SessionsRepositorie) CreateSession(sessionID string, userID uuid.UUID) error {
	_, err := s.DB.Exec(`INSERT INTO Session (session_id, user_id) VALUES (?, ?)`, sessionID, userID)
	return err
}

func (s *SessionsRepositorie) GetUserBySession(sessionID string) (string, error) {
	userId := ""
	if err := s.DB.QueryRow(`SELECT user_id FROM Session WHERE session_id = ?`, sessionID).Scan(&userId); err != nil {
		return "", err
	}

	return userId, nil
}
