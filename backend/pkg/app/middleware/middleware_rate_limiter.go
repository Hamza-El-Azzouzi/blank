// package middleware

// import (
// 	"net/http"
// 	"sync"
// 	"time"
// )

// type RateLimiter struct {
// 	Limit    int
// 	Interval time.Duration
// 	Requests []time.Time
// 	Mutex    sync.Mutex
// }

// func NewRateLimiter(limit int, interval time.Duration) *RateLimiter {
// 	return &RateLimiter{
// 		Limit:    limit,
// 		Interval: interval,
// 		Requests: make([]time.Time, 0, limit),
// 	}
// }

// func (rl *RateLimiter) Allow() bool {
// 	rl.Mutex.Lock()
// 	defer rl.Mutex.Unlock()
// 	now := time.Now()
// 	windowStart := now.Add(-rl.Interval)
// 	i := 0
// 	for ; i < len(rl.Requests); i++ {
// 		if rl.Requests[i].After(windowStart) {
// 			break
// 		}
// 	}
// 	rl.Requests = rl.Requests[i:]
// 	if len(rl.Requests) >= rl.Limit {
// 		return false
// 	}
// 	rl.Requests = append(rl.Requests, now)
// 	return true
// }

// func RateLimitMiddleware(next http.Handler) http.Handler {
// 	limiter := NewRateLimiter(500, time.Second)

//		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
//			if limiter.Allow() {
//				next.ServeHTTP(w, r)
//			} else {
//				http.Error(w, "Too Many Requests", http.StatusTooManyRequests)
//			}
//		})
//	}
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

// Create a rate limiter allowing 10 requests per minute
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
				// log the panic and stack trace
				message := "Caught panic: %v, Stack trace: %s"
				log.Printf(message, err, string(debug.Stack()))
				utils.SendResponses(w, http.StatusInternalServerError, "Internal Server Error", nil)
			}
		}()
		next.ServeHTTP(w, r)
	})
}

// isAllowed checks if the client is within the rate limit.
func (rl *RateLimiter) isAllowed(clientIP string) bool {
	rl.mu.Lock()
	defer rl.mu.Unlock()

	now := time.Now()

	// Check if the client already exists
	if client, exists := rl.clients[clientIP]; exists {
		// if the window expires then reset the requests count
		if now.Sub(client.LastRequest) > rl.window {
			client.Requests = 1
			client.LastRequest = now
			return true
		}

		// Check if the client exceeded the limit
		if client.Requests >= rl.limit {
			return false
		}

		// Increment request count
		client.Requests++
		client.LastRequest = now
		return true
	}

	// Create a new client entry
	rl.clients[clientIP] = &ClientRate{
		Requests:    1,
		LastRequest: now,
	}
	return true
}

// Middleware applies rate limiting to an HTTP handler.
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

// func RateLimitMiddleware(next http.Handler) http.Handler {
// 	limiter := NewRateLimiter(500, time.Second)

//		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
//			if limiter.Allow() {
//				next.ServeHTTP(w, r)
//			} else {
//				http.Error(w, "Too Many Requests", http.StatusTooManyRequests)
//			}
//		})
//	}
