package utils

import (
	"log"
	"time"

	"blank/pkg/app/services"
)

type Cleaner struct {
	SessionService *services.SessionService
}

func (c *Cleaner) CleanupExpiredSessions() {
	for {
		time.Sleep(time.Minute)
		time := time.Now()
		err := c.SessionService.DeleteSessionByDate(time)
		if err != nil {
			log.Printf("Error deleting expired sessions: %v", err)
		}
	}
}
