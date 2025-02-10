package middleware

import (
	"net/http"
)


func CheckCORS(next http.Handler) http.Handler {
	var originAllowlist = "http://127.0.0.1:3000"
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		origin := r.Header.Get("Origin")
		if origin == originAllowlist {
			w.Header().Set("Access-Control-Allow-Origin", origin)
		}
		next.ServeHTTP(w, r)
	})
}
