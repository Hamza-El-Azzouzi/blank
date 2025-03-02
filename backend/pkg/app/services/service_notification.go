package services

import (
	"blank/pkg/app/models"
	"blank/pkg/app/repositories"

	"github.com/gofrs/uuid/v5"
)

type NotificationService struct {
	NotificationRepo *repositories.NotificationRepository
}

func (n *NotificationService) Notifications(userID uuid.UUID, page int) ([]models.Notification, error) {
	limit := 20
	offset := page * limit
	return n.NotificationRepo.GetNotifications(userID, offset, limit)
}

// func (n *NotificationService) SaveNotification(notification models.Notification) error {
// 	return n.NotificationRepo.Create(notification)
// }
