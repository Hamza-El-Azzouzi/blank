package routes

import (
	"net/http"

	"blank/pkg/app/handlers"
	"blank/pkg/app/middleware"
	"blank/pkg/app/utils"
)

func SetupRoutes(mux *http.ServeMux, authHandler *handlers.AuthHandler, postHandler *handlers.PostHandler, reactHandler *handlers.ReactHandler, authMiddleware *middleware.AuthMiddleware, messageHnadler *handlers.MessageHandler) {
	mux.HandleFunc("/ws", middleware.RateLimitMiddleware(messageHnadler.MessageReceiver))

	mux.HandleFunc("/static/", middleware.RateLimitMiddleware(utils.SetupStaticFilesHandlers))
	mux.HandleFunc("/api/online-users", middleware.RateLimitMiddleware(messageHnadler.GetOnlineUsers))
	mux.HandleFunc("/api/logout", middleware.RateLimitMiddleware(authHandler.LogoutHandle))
	mux.HandleFunc("/api/register", middleware.RateLimitMiddleware(authHandler.RegisterHandle))
	mux.HandleFunc("/api/login", middleware.RateLimitMiddleware(authHandler.LoginHandle))
	mux.HandleFunc("/api/integrity", middleware.RateLimitMiddleware(authHandler.UserIntegrity))
	mux.HandleFunc("/api/users/", middleware.RateLimitMiddleware(authHandler.GetUsers))
	mux.HandleFunc("/api/searchedusers", middleware.RateLimitMiddleware(authHandler.SearchUsers))
	mux.HandleFunc("/api/messages", middleware.RateLimitMiddleware(authHandler.GetUsers))
	mux.HandleFunc("/api/checkUnreadMesg", middleware.RateLimitMiddleware(messageHnadler.UnReadMessages))
	mux.HandleFunc("/api/markAsRead", middleware.RateLimitMiddleware(messageHnadler.MarkReadMessages))

	mux.HandleFunc("/api/posts/", middleware.RateLimitMiddleware(postHandler.Posts))
	mux.HandleFunc("/api/categories", middleware.RateLimitMiddleware(postHandler.GetCategories))

	mux.HandleFunc("/api/createpost", middleware.RateLimitMiddleware(postHandler.PostSaver))

	mux.HandleFunc("/api/sendcomment", middleware.RateLimitMiddleware(postHandler.CommentSaver))
	mux.HandleFunc("/api/comment/", middleware.RateLimitMiddleware(postHandler.CommentGetter))

	mux.HandleFunc("/api/reacts", middleware.RateLimitMiddleware(reactHandler.React))

	mux.HandleFunc("/api/getmessages", middleware.RateLimitMiddleware(messageHnadler.GetMessages))

	mux.HandleFunc("/", middleware.RateLimitMiddleware(func(w http.ResponseWriter, r *http.Request) {
		utils.OpenHtml("index.html", w, "")
	}))

	http.HandleFunc("/", middleware.RateLimitMiddleware(func(w http.ResponseWriter, r *http.Request) {
		handler, pattern := mux.Handler(r)
		if pattern == "/" && r.URL.Path != "/" {
			utils.OpenHtml("index.html", w, "404")
			return
		}
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Origin, Content-Type, Accept")
		handler.ServeHTTP(w, r)
	}))
}
