package repositories

import (
	"database/sql"

	"blank/pkg/app/models"

	"github.com/gofrs/uuid/v5"
)

type MessageRepository struct {
	DB *sql.DB
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
