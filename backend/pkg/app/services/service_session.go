package services

import (
	"blank/pkg/app/repositories"

	"github.com/gofrs/uuid/v5"
)

type SessionService struct {
	SessionRepo *repositories.SessionsRepositorie
}

func (s *SessionService) DeleteSession(sessionID string) error {
	return s.SessionRepo.DeleteSession(sessionID)
}

func (s *SessionService) CheckSession(sessionID string) (string,bool) {
	return s.SessionRepo.CheckSession(sessionID)
}

func (s *SessionService) CreateSession(sessionID string, userID uuid.UUID) error {
	return s.SessionRepo.CreateSession(sessionID, userID)
}

func (s *SessionService) GetUserService(sessionId string) (string, error) {
	userID, err := s.SessionRepo.GetUserBySession(sessionId)
	if err != nil {
		return "", err
	}
	return userID, nil
}
