package routes

import (
	"net/http"

	"real-time-forum/internal/handlers"
	"real-time-forum/internal/middleware"
	"real-time-forum/internal/utils"
)

func SetupRoutes(mux *http.ServeMux, authHandler *handlers.AuthHandler, postHandler *handlers.PostHandler, reactHandler *handlers.ReactHandler, authMiddleware *middleware.AuthMiddleware, messageHnadler *handlers.MessageHandler) {
	mux.HandleFunc("/ws", utils.RateLimitMiddleware(messageHnadler.MessageReceiver))

	mux.HandleFunc("/static/", utils.RateLimitMiddleware(utils.SetupStaticFilesHandlers))
	mux.HandleFunc("/api/online-users", utils.RateLimitMiddleware(messageHnadler.GetOnlineUsers))
	mux.HandleFunc("/api/logout", utils.RateLimitMiddleware(authHandler.LogoutHandle))
	mux.HandleFunc("/api/register", utils.RateLimitMiddleware(authHandler.RegisterHandle))
	mux.HandleFunc("/api/login", utils.RateLimitMiddleware(authHandler.LoginHandle))
	mux.HandleFunc("/api/integrity", utils.RateLimitMiddleware(authHandler.UserIntegrity))
	mux.HandleFunc("/api/users/", utils.RateLimitMiddleware(authHandler.GetUsers))
	mux.HandleFunc("/api/searchedusers", utils.RateLimitMiddleware(authHandler.SearchUsers))
	mux.HandleFunc("/api/messages", utils.RateLimitMiddleware(authHandler.GetUsers))
	mux.HandleFunc("/api/checkUnreadMesg", utils.RateLimitMiddleware(messageHnadler.UnReadMessages))
	mux.HandleFunc("/api/markAsRead", utils.RateLimitMiddleware(messageHnadler.MarkReadMessages))

	mux.HandleFunc("/api/posts/", utils.RateLimitMiddleware(postHandler.Posts))
	mux.HandleFunc("/api/categories", utils.RateLimitMiddleware(postHandler.GetCategories))

	mux.HandleFunc("/api/createpost", utils.RateLimitMiddleware(postHandler.PostSaver))

	mux.HandleFunc("/api/sendcomment", utils.RateLimitMiddleware(postHandler.CommentSaver))
	mux.HandleFunc("/api/comment/", utils.RateLimitMiddleware(postHandler.CommentGetter))

	mux.HandleFunc("/api/reacts", utils.RateLimitMiddleware(reactHandler.React))

	mux.HandleFunc("/api/getmessages", utils.RateLimitMiddleware(messageHnadler.GetMessages))

	mux.HandleFunc("/",utils.RateLimitMiddleware(func(w http.ResponseWriter, r *http.Request) {
		utils.OpenHtml("index.html", w, "")
	}))

	http.HandleFunc("/",utils.RateLimitMiddleware(func(w http.ResponseWriter, r *http.Request) {
		handler, pattern := mux.Handler(r)
		if pattern == "/" && r.URL.Path != "/" {
			utils.OpenHtml("index.html", w, "404")
			return
		}
		handler.ServeHTTP(w, r)
	}))
}
