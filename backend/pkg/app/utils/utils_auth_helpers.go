package utils

import (
	"regexp"
	"strconv"
	"strings"
	"time"

	"golang.org/x/crypto/bcrypt"
)

const (
	ExpFullName = `^[a-zA-Z ]{3,20}$`
	ExpEmail    = `(?i)^[a-z0-9]+\.?[a-z0-9]+@[a-z0-9]+\.[a-z]{2,}$`
	ExpNickname = `^[a-zA-Z0-9_.-]{3,20}$`
)

func ValidateFullName(name string) (bool, string) {
	if isValid, _ := regexp.MatchString(ExpFullName, name); !isValid {
		return false, "name can only contain characters, and connot axceed 20 characters"
	}

	return true, ""
}

func ValidateDateOfBirth(dateOfBirth string) (bool, string) {
	if _, err := time.Parse("2006-01-02", dateOfBirth); err != nil {
		return false, "invalid date format"
	}

	year, err := strconv.Atoi(strings.Split(dateOfBirth, "-")[0])
	if err != nil {
		return false, "invalid date format"
	}

	if year > 2009 {
		return false, "Our policy requires age to be bigger than 15"
	}

	return true, ""
}

func ValidateNickname(nickname string) (bool, string) {
	if nickname == "" {
		return true, ""
	}

	if isValid, _ := regexp.MatchString(ExpNickname, nickname); !isValid {
		return false, "name can only contain characters, and connot axceed 20 characters"
	}

	return true, ""
}

func ValidateAboutMe(aboutMe string) (bool, string) {
	aboutMe = strings.TrimSpace(aboutMe)
	if aboutMe == "" {
		return true, ""
	}

	if len(aboutMe) > 150 {
		return false, "about me section cannot axceed 150 character"
	}

	return true, ""
}

func ValidateEmail(email string) (bool, string) {
	email = strings.TrimSpace(email)

	if len(email) < 5 && len(email) > 50 {
		return false, "Email must be between 5 and 50 characters long"
	}

	if isValid, _ := regexp.MatchString(ExpEmail, email); !isValid {
		return false, "Invalid email format"
	}

	return true, ""
}

func ValidatePassword(password string) (bool, string) {
	if len(password) < 6 && len(password) > 50 {
		return false, "Password must be between 6 and 50 characters long"
	}
	if isValid, _ := regexp.MatchString("[A-Z]", password); !isValid {
		return false, "Password must contain at least one uppercase letter"
	}
	if isValid, _ := regexp.MatchString("[a-z]", password); !isValid {
		return false, "Password must contain at least one lowercase letter"
	}
	if isValid, _ := regexp.MatchString("[0-9]", password); !isValid {
		return false, "Password must contain at least one number"
	}
	return true, ""
}

func HashPassword(psswd string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(psswd), bcrypt.DefaultCost)
	return string(bytes), err
}
