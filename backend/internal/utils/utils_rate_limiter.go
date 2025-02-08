package utils

import (
	"net/http"
	"sync"
	"time"
)


type RateLimiter struct {
	Limit    int
	Interval time.Duration
	Requests []time.Time
	Mutex    sync.Mutex
}

func NewRateLimiter(limit int, interval time.Duration) *RateLimiter {
	return &RateLimiter{
		Limit:    limit,
		Interval: interval,
		Requests: make([]time.Time, 0, limit),
	}
}

func (rl *RateLimiter) Allow() bool {
	rl.Mutex.Lock()
	defer rl.Mutex.Unlock()
	now := time.Now()
	windowStart := now.Add(-rl.Interval)
	i := 0
	for ; i < len(rl.Requests); i++ {
		if rl.Requests[i].After(windowStart) {
			break
		}
	}
	rl.Requests = rl.Requests[i:]
	if len(rl.Requests) >= rl.Limit {
		return false
	}
	rl.Requests = append(rl.Requests, now)
	return true
}

func RateLimitMiddleware(next http.HandlerFunc) http.HandlerFunc {
	limiter := NewRateLimiter(100, time.Second)
	return func(response http.ResponseWriter, request *http.Request) {
		if limiter.Allow() {
			next(response, request)
		} else {
			response.WriteHeader(http.StatusTooManyRequests)
		}
	}
}

