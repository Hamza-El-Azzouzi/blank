package utils

import (
	"net/http"
	"os"
)

func SetCookies(w http.ResponseWriter, name, value string) {
	cookie := &http.Cookie{
		Name:     name,
		Value:    value,
		Path:     "/",
		HttpOnly: false,
		Secure:   true,
		SameSite: http.SameSiteNoneMode,
		Domain:   os.Getenv("DOMAIN"),
	}

	http.SetCookie(w, cookie)
}
