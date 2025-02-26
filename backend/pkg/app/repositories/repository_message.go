package repositories

import (
	"database/sql"

	"blank/pkg/app/models"

	"github.com/gofrs/uuid/v5"
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

func (m *MessageRepository) Create(messageId uuid.UUID, msg string, reciever_id string, sender uuid.UUID, date string) error {
	Query := "INSERT INTO messages (id,user_id_sender,user_id_receiver,message,created_at)VALUES (?,?,?,?,?)"
	preparedQuery, err := m.DB.Prepare(Query)
	if err != nil {
		return err
	}
	_, err = preparedQuery.Exec(messageId, sender, reciever_id, msg, date)
	return err
}

func (m *MessageRepository) GetMessages(senderID, receiverID string, offset int) ([]models.MessageWithTime, error) {
	querySelect := `
SELECT 
    m.*, 
    sender.username AS sender_username, 
    receiver.username AS receiver_username
FROM 
    messages m
JOIN 
    users sender ON m.user_id_sender = sender.id
JOIN 
    users receiver ON m.user_id_receiver = receiver.id
WHERE 
    (m.user_id_sender = ? AND m.user_id_receiver = ?) 
    OR 
    (m.user_id_sender = ? AND m.user_id_receiver = ?)
ORDER BY 
    m.created_at DESC
LIMIT 10 OFFSET ?;
	`
	rows, queryErr := m.DB.Query(querySelect, senderID, receiverID, receiverID, senderID, offset)
	if queryErr != nil {
		return nil, queryErr
	}
	defer rows.Close()
	var messages []models.MessageWithTime
	for rows.Next() {
		var currentMessage models.MessageWithTime
		scanErr := rows.Scan(
			&currentMessage.MessageID,
			&currentMessage.SenderID,
			&currentMessage.ReceiverID,
			&currentMessage.Content,
			&currentMessage.Unreaded,
			&currentMessage.CreatedAt,
			&currentMessage.UserNameSender,
			&currentMessage.UserNameReceiver,
		)
		if scanErr != nil {
			return nil, scanErr
		}
		currentMessage.FormattedDate = currentMessage.CreatedAt.Format("2006-01-02 15:04")
		messages = append(messages, currentMessage)
	}
	return messages, nil
}

func (m *MessageRepository) CheckUnReadMsg(userID string) ([]string, error) {
	querySelect := `
	SELECT DISTINCT user_id_sender 
	FROM messages
	WHERE user_id_receiver = ?  AND un_readed == 0;`
	rows, queryErr := m.DB.Query(querySelect, userID)
	if queryErr != nil {
		return nil, queryErr
	}
	defer rows.Close()
	usersID := []string{}
	for rows.Next() {
		var userId string
		scanErr := rows.Scan(&userId)
		if scanErr != nil {
			return nil, scanErr
		}
		usersID = append(usersID, userId)
	}
	return usersID, nil
}

func (m *MessageRepository) MarkReadMsg(sender string, receiver uuid.UUID) error {
	queryUpdate := ` UPDATE messages SET un_readed = 1 WHERE user_id_sender = ? AND user_id_receiver = ?;`
	preparedQuery, err := m.DB.Prepare(queryUpdate)
	if err != nil {
		return err
	}
	_, queryErr := preparedQuery.Exec(sender, receiver)
	if queryErr != nil {
		return queryErr
	}

	return nil
}

func (r *MessageRepository) IsNewUser(userId uuid.UUID) bool {
	exist := 0
	query := `SELECT Count(*) From messages WHERE user_id_sender = ? OR user_id_receiver = ?`
	err := r.DB.QueryRow(query, userId, userId).Scan(&exist)
	if err != nil {
		return err == sql.ErrNoRows
	}

	return exist == 0
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
		m.seen AS IsSeen
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

	rows, err := m.DB.Query(query, userID, userID, userID, userID, userID, offset)
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
