package middleware

import (
	"log"
	"net/http"
	"runtime/debug"
	"sync"
	"time"

	"blank/pkg/app/utils"
)

type ClientRate struct {
	Requests    int
	LastRequest time.Time
}

type RateLimiter struct {
	clients map[string]*ClientRate
	mu      sync.Mutex
	limit   int
	window  time.Duration
}

func NewRateLimiter(limit int, window time.Duration) *RateLimiter {
	return &RateLimiter{
		clients: make(map[string]*ClientRate),
		limit:   limit,
		window:  window,
	}
}

func Recovery(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		defer func() {
			if err := recover(); err != nil {
				message := "Caught panic: %v, Stack trace: %s"
				log.Printf(message, err, string(debug.Stack()))
				utils.SendResponses(w, http.StatusInternalServerError, "Internal Server Error", nil)
			}
		}()
		next.ServeHTTP(w, r)
	})
}

func (rl *RateLimiter) isAllowed(clientIP string) bool {
	rl.mu.Lock()
	defer rl.mu.Unlock()

	now := time.Now()

	if client, exists := rl.clients[clientIP]; exists {
		if now.Sub(client.LastRequest) > rl.window {
			client.Requests = 1
			client.LastRequest = now
			return true
		}
		if client.Requests >= rl.limit {
			return false
		}

		client.Requests++
		client.LastRequest = now
		return true
	}

	rl.clients[clientIP] = &ClientRate{
		Requests:    1,
		LastRequest: now,
	}
	return true
}

func (rl *RateLimiter) Middleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		clientIP := r.RemoteAddr
		if !rl.isAllowed(clientIP) {
			utils.SendResponses(w, http.StatusTooManyRequests, "Too Many Requests", nil)
			return
		}
		next.ServeHTTP(w, r)
	})
}

