package services

import (
	"net/http"
	"time"

	"blank/pkg/app/models"
	"blank/pkg/app/repositories"
	"blank/pkg/app/utils"

	"github.com/gofrs/uuid/v5"
	"golang.org/x/crypto/bcrypt"
)

type AuthService struct {
	UserRepo    *repositories.UserRepository
	MessageRepo *repositories.MessageRepository
}

func (a *AuthService) Register(info models.RegisterData) (int, string) {
	hashed, err := utils.HashPassword(info.Password)
	if err != nil {
		return http.StatusInternalServerError, "Internal Server Error"
	}

	user_id := uuid.Must(uuid.NewV4())
	date, _ := time.Parse("2006-01-02", info.DateOfBirth)

	avatarFilename, err := utils.SaveImage(info.Avatar)
	if err != nil {
		return http.StatusBadRequest, "Invalid Image"
	}
	accountType := false
	if info.AccountType == "public" {
		accountType = true
	}
	user := &models.User{
		ID:          user_id,
		FirstName:   info.FirstName,
		LastName:    info.LastName,
		Email:       info.Email,
		Password:    hashed,
		DateOfBirth: date,
		Nickname:    info.Nickname,
		AboutMe:     info.AboutMe,
		Avatar:      avatarFilename,
		IsPublic:    accountType,
	}

	err = a.UserRepo.Create(user)
	if err != nil {
		if err.Error() == "UNIQUE constraint failed: User.email" {
			return http.StatusNotAcceptable, "email already exists"
		}
		return http.StatusInternalServerError, "Internal Server Error"
	}
	return http.StatusOK, "success"
}

func (a *AuthService) Login(email, password string) (*models.User, string) {
	userByEmail, err := a.UserRepo.FindUser(email, "byEmail")
	if userByEmail == nil || err != nil {
		return nil, "No Account Found With This Email"
	}

	err = bcrypt.CompareHashAndPassword([]byte(userByEmail.Password), []byte(password))
	if err != nil {
		return nil, "Incorrect Password"
	}

	return userByEmail, ""
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


