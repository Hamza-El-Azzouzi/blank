package services

import (
	"database/sql"
	"time"

	"blank/pkg/app/repositories"

	"github.com/gofrs/uuid/v5"
)

type SessionService struct {
	SessionRepo *repositories.SessionsRepositorie
}

func (s *SessionService) DeleteSession(sessionID string) error {
	return s.SessionRepo.DeletSession(sessionID)
}

func (s *SessionService) CheckSession(sessionID string) bool {
	return s.SessionRepo.CheckSession(sessionID)
}

func (s *SessionService) CreateSession(sessionID string, expiration time.Time, userID uuid.UUID) error {
	err := s.SessionRepo.CheckUserAlreadyLogged(userID)
	if err != nil {
		if err == sql.ErrNoRows {
			return s.SessionRepo.Createession(sessionID, expiration, userID)
		} else {
			return err
		}
	}
	return s.SessionRepo.UpdateSession(sessionID, expiration, userID)
}

func (s *SessionService) DeleteSessionByDate(time time.Time) error {
	return s.SessionRepo.DeleteSessionByDate(time)
}

func (s *SessionService) GetUserService(sessionId string) (string, error) {
	userID, err := s.SessionRepo.GetUser(sessionId)
	if err != nil {
		return "", err
	}
	return userID, nil
}
