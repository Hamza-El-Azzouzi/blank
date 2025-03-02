package repositories

import (
	"database/sql"

	"blank/pkg/app/models"

	"github.com/gofrs/uuid/v5"
)

type NotificationRepository struct {
	DB *sql.DB
}

func (n *NotificationRepository) CreateGroupNotification(notification models.Notification) error {
	query := `
		INSERT INTO Notification (
			notification_id, 
			receiver_id, 
			type, 
			group_id
		) 
		VALUES (?, ?, ?, ?)
	`

	prp, err := n.DB.Prepare(query)
	if err != nil {
		return err
	}
	defer prp.Close()

	_, err = prp.Exec(
		notification.ID,
		notification.ReceiverID,
		notification.Type,
		notification.GroupID,
	)
	if err != nil {
		return err
	}

	return nil
}

func (n *NotificationRepository) GetNotifications(userID uuid.UUID, offset, limit int) ([]models.Notification, error) {
	querySelect := `
		SELECT
			n.notification_id,
			n.type,
			n.group_id,
			g.title
			n.user_id,
			u.first_name || ' ' || u.last_name as username,
			u.avatar,
			n.seen,
			n.created_at,
		FROM
			Notification n
			LEFT JOIN User u ON n.receiver_id = u.user_id
			LEFT JOIN 'Group' g ON n.group_id = g.group_id
		WHERE
			n.receiver_id = "hhh"
		ORDER BY
			n.created_at DESC
		LIMIT 10
		OFFSET 0;
		`

	rows, queryErr := n.DB.Query(querySelect, userID, limit, offset)
	if queryErr != nil {
		return nil, queryErr
	}
	defer rows.Close()
	var notifications []models.Notification
	for rows.Next() {
		var notif models.Notification
		scanErr := rows.Scan(
			&notif.ID,
			&notif.Type,
			&notif.GroupID,
			&notif.GroupTitle,
			&notif.UserID,
			&notif.UserName,
			&notif.Avatar,
			&notif.Seen,
			&notif.CreatedAt,
		)
		if scanErr != nil {
			return nil, scanErr
		}
		notif.FormattedDate = notif.CreatedAt.Format("01/02/2006, 3:04:05 PM")
		notifications = append(notifications, notif)
	}
	return notifications, nil
}
