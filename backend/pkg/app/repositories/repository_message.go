package repositories

import (
	"database/sql"

	"blank/pkg/app/models"
)

type MessageRepository struct {
	DB *sql.DB
}

func (m *MessageRepository) SaveMessage(message models.Message) error {
	Query := `
		INSERT INTO Message (
			message_id,
			sender_id,
			receiver_id,
			content
			)
		VALUES (?,?,?,?)
	`
	preparedQuery, err := m.DB.Prepare(Query)
	if err != nil {
		return err
	}
	_, err = preparedQuery.Exec(
		message.ID,
		message.SenderID,
		message.ReceiverID,
		message.Content,
	)
	return err
}

func (m *MessageRepository) GetContactUsers(userID string, offset int) ([]models.ContactUser, error) {
	query := `
	SELECT 
		u.user_id,
		u.first_name,
		u.last_name,
		u.avatar,
		m.content AS LastMessage,
		m.created_at AS LastMessageTime,
		CASE
        	WHEN m.sender_id = ? THEN 1
        	ELSE m.seen
    	END AS IsSeen
	FROM User u
	LEFT JOIN Message m
		ON m.message_id = (
			SELECT message_id
			FROM Message
			WHERE ((sender_id = u.user_id AND receiver_id = ?) OR (sender_id = ? AND receiver_id = u.user_id))
			AND group_id IS NULL
			ORDER BY created_at DESC
			LIMIT 1
		)
	WHERE 
		u.user_id != ?
		AND EXISTS (
			SELECT 1
			FROM Message
			WHERE ((sender_id = u.user_id AND receiver_id = ?) OR (sender_id = ? AND receiver_id = u.user_id))
			AND group_id IS NULL
		)
	ORDER BY m.created_at DESC
	LIMIT 20 OFFSET ?
	`

	rows, err := m.DB.Query(query, userID, userID, userID, userID, userID, userID, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var contacts []models.ContactUser

	for rows.Next() {
		var contact models.ContactUser

		if err := rows.Scan(&contact.UserID, &contact.FirstName, &contact.LastName, &contact.Avatar,
			&contact.LastMessage, &contact.LastMessageTime, &contact.IsSeen); err != nil {
			return nil, err

		}

		contacts = append(contacts, contact)
	}

	return contacts, nil
}

func (m *MessageRepository) GetUserMessages(authUserID, userID string, offset int) ([]models.MessageHistory, error) {
	query := `
    SELECT
		message_id,
		sender_id,
		receiver_id,
		content,
		seen,
		created_at
    FROM Message
    WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
    AND group_id IS NULL
    ORDER BY created_at ASC
	LIMIT 20 OFFSET ?
    `

	rows, err := m.DB.Query(query, authUserID, userID, userID, authUserID, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var messages []models.MessageHistory
	for rows.Next() {
		var msg models.MessageHistory
		err := rows.Scan(&msg.MessageID, &msg.SenderID, &msg.ReceiverID, &msg.Content, &msg.Seen, &msg.CreatedAt)
		if err != nil {
			return nil, err
		}
		messages = append(messages, msg)
	}

	return messages, nil
}

func (m *MessageRepository) MarkMessagesAsSeen(receiverID, senderID string) error {
	query := `
    UPDATE Message
    SET seen = 1
    WHERE sender_id = ? AND receiver_id = ? AND seen = 0
    `

	_, err := m.DB.Exec(query, senderID, receiverID)
	return err
}
