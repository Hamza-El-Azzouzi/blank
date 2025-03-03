package repositories

import (
	"database/sql"
	"log"

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

func (n *NotificationRepository) CreateUserNotification(notification models.Notification) error {
	query := `
		INSERT INTO Notification (
			notification_id, 
			receiver_id, 
			type, 
			user_id
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
		notification.UserID,
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
			g.title,
			n.user_id,
			u.first_name || ' ' || u.last_name as username,
			n.seen,
			n.created_at
		FROM
			Notification n
			LEFT JOIN User u ON n.receiver_id = u.user_id
			LEFT JOIN 'Group' g ON n.group_id = g.group_id
		WHERE
			n.receiver_id = ?
		ORDER BY
			n.created_at DESC
		LIMIT ?
		OFFSET ?;
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

func (n *NotificationRepository) SeeNotification(userID, notifID uuid.UUID) error {
	queryUpdate := `
	UPDATE Notification
	SET
		seen = 1
	WHERE receiver_id = ?
      AND notification_id = ?;
	`
	preparedQuery, err := n.DB.Prepare(queryUpdate)
	if err != nil {
		return err
	}
	_, err = preparedQuery.Exec(userID, notifID)
	if err != nil {
		return err
	}

	return nil
}

func (n *NotificationRepository) LastNotification(receiverID, userID uuid.UUID, NotifType string) (uuid.UUID, error) {
	var lastNotifID uuid.UUID
	query := `
		SELECT notification_id
		FROM Notification
		WHERE 
			receiver_id = ?
			AND user_id = ?
			AND type = ?
		ORDER BY 
			created_at DESC
		LIMIT 1;
	`

	err := n.DB.QueryRow(query, receiverID, userID, NotifType).Scan(&lastNotifID)
	if err != nil {
		if err == sql.ErrNoRows {
			log.Println("no row")
			return uuid.Nil, nil
		}
		return uuid.Nil, err
	}

	return lastNotifID, err
}
