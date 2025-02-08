package services

import (
	"fmt"
	"strings"

	"blank/pkg/app/models"
	"blank/pkg/app/repositories"

	"github.com/gofrs/uuid/v5"
	"golang.org/x/crypto/bcrypt"
)

type AuthService struct {
	UserRepo    *repositories.UserRepository
	MessageRepo *repositories.MessageRepository
}

func HashPassword(psswd string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(psswd), bcrypt.DefaultCost)
	return string(bytes), err
}

func (a *AuthService) Register(info models.SignUpData) error {
	checkByEmail, _ := a.UserRepo.FindUser(info.Email, "byEmail")
	if checkByEmail != nil {
		return fmt.Errorf("email")
	}

	hash, err := HashPassword(info.Passwd)
	if err != nil {
		return err
	}
	user_id := uuid.Must(uuid.NewV4())
	user := &models.User{
		ID:           user_id,
		Age:          info.Age,
		Gender:       info.Gender,
		FirstName:    info.FirstName,
		LastName:     info.LastName,
		Username:     info.Username,
		Email:        info.Email,
		PasswordHash: hash,
	}
	return a.UserRepo.Create(user)
}

func (a *AuthService) Login(emailOrUSername, password string) (*models.User, error) {
	var userByEmail *models.User
	var err error
	if strings.Contains(emailOrUSername, "@") {
		userByEmail, err = a.UserRepo.FindUser(emailOrUSername, "byEmail")
	} else {
		userByEmail, err = a.UserRepo.FindUser(emailOrUSername, "byUserName")
	}

	if userByEmail == nil || err != nil {
		return nil, fmt.Errorf("in email or username")
	}

	err = bcrypt.CompareHashAndPassword([]byte(userByEmail.PasswordHash), []byte(password))
	if err != nil {
		return nil, err
	}

	return userByEmail, nil
}

func (a *AuthService) GetUserBySessionID(sessionID string) (*models.User, error) {
	user, err := a.UserRepo.GetUserBySessionID(sessionID)
	if err != nil {
		return nil, err
	}
	return user, nil
}

func (a *AuthService) GetUsers(sessionID string, nPagination int) ([]models.User, error) {
	user, err := a.GetUserBySessionID(sessionID)
	if err != nil {
		return nil, err
	}
	isNew := a.MessageRepo.IsNewUser(user.ID)
	allUser, errUser := a.UserRepo.GetUsers(user.ID, isNew, nPagination)
	if errUser != nil {
		return nil, err
	}
	return allUser, nil
}

func (a *AuthService) GetUserByUserName(userName, session_id string) ([]models.User, error) {
	user, err := a.GetUserBySessionID(session_id)
	if err != nil {
		return nil, err
	}
	allUser, errUser := a.UserRepo.GetUserByUserName(userName, user.ID)
	if errUser != nil {
		return nil, errUser
	}
	return allUser, nil
}
