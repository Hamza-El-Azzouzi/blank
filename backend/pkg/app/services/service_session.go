package services

import (
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

func (s *SessionService) CreateSession(sessionID string, userID uuid.UUID) error {
	return s.SessionRepo.CreateSession(sessionID, userID)
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
