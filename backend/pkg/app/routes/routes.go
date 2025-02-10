package routes

import (
	"net/http"

	"blank/pkg/app/handlers"
	"blank/pkg/app/middleware"
	"blank/pkg/app/utils"
)

func SetupRoutes(mux *http.ServeMux, authHandler *handlers.AuthHandler, postHandler *handlers.PostHandler, reactHandler *handlers.ReactHandler, authMiddleware *middleware.AuthMiddleware, messageHnadler *handlers.MessageHandler, userHandler *handlers.UserHandler) {


	mux.HandleFunc("/static/", utils.SetupStaticFilesHandlers)
	mux.HandleFunc("/api/online-users", messageHnadler.GetOnlineUsers)
	mux.HandleFunc("/api/logout", authHandler.LogoutHandle)
	mux.HandleFunc("/api/register", authHandler.RegisterHandle)
	mux.HandleFunc("/api/login", authHandler.LoginHandle)
	mux.HandleFunc("/api/integrity", authHandler.UserIntegrity)
	mux.HandleFunc("/api/users/", authHandler.GetUsers)
	mux.HandleFunc("/api/searchedusers", authHandler.SearchUsers)
	mux.HandleFunc("/api/messages", authHandler.GetUsers)
	mux.HandleFunc("/api/checkUnreadMesg", messageHnadler.UnReadMessages)
	mux.HandleFunc("/api/markAsRead", messageHnadler.MarkReadMessages)

	mux.HandleFunc("/api/posts/", postHandler.Posts)
	mux.HandleFunc("/api/categories", postHandler.GetCategories)
	mux.HandleFunc("/api/createpost", postHandler.PostSaver)
	mux.HandleFunc("/api/sendcomment", postHandler.CommentSaver)
	mux.HandleFunc("/api/comment/", postHandler.CommentGetter)
	mux.HandleFunc("/api/reacts", reactHandler.React)
	mux.HandleFunc("/api/getmessages", messageHnadler.GetMessages)

	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		utils.OpenHtml("index.html", w, "")
	})

}


