package routes

import (
	"net/http"

	"blank/pkg/app/handlers"
	"blank/pkg/app/middleware"
	"blank/pkg/app/utils"
)

func SetupRoutes(mux *http.ServeMux, authHandler *handlers.AuthHandler, postHandler *handlers.PostHandler, reactHandler *handlers.ReactHandler, authMiddleware *middleware.AuthMiddleware, messageHnadler *handlers.MessageHandler, userHandler *handlers.UserHandler , groupHandler *handlers.GroupHandler) {
	mux.HandleFunc("/static/", utils.SetupStaticFilesHandlers)
	mux.HandleFunc("/api/online-users", messageHnadler.GetOnlineUsers)
	mux.HandleFunc("/api/logout", authHandler.HandleLogout)
	mux.HandleFunc("/api/register", authHandler.HandleRegister)
	mux.HandleFunc("/api/login", authHandler.HandleLogin)
	mux.HandleFunc("/api/integrity", authHandler.UserIntegrity)
	mux.HandleFunc("/storage/avatars/{avatar}", handlers.ServeImages)

	mux.HandleFunc("/api/users/", authHandler.GetUsers)
	mux.HandleFunc("/api/searchedusers", authHandler.SearchUsers)
	mux.HandleFunc("/api/messages", authHandler.GetUsers)
	mux.HandleFunc("/api/checkUnreadMesg", messageHnadler.UnReadMessages)
	mux.HandleFunc("/api/markAsRead", messageHnadler.MarkReadMessages)

	mux.HandleFunc("/api/user-info/{id}", userHandler.InfoGetter)
	mux.HandleFunc("/api/user-update-info", userHandler.UpdateUserInfo)
	mux.HandleFunc("/api/user-posts/{id}/", postHandler.PostsByUser)

	mux.HandleFunc("/api/posts/", postHandler.Posts)
	mux.HandleFunc("/api/createpost", postHandler.PostSaver)
	mux.HandleFunc("/api/sendcomment", postHandler.CommentSaver)
	mux.HandleFunc("/api/comment/", postHandler.CommentGetter)
	mux.HandleFunc("/api/reacts", reactHandler.React)
	mux.HandleFunc("/api/getmessages", messageHnadler.GetMessages)


	mux.HandleFunc("/api/createGroup", groupHandler.CreateGroup)
	mux.HandleFunc("/api/groups/", groupHandler.Groups)
	mux.HandleFunc("/api/groups/search", groupHandler.GroupSearch)
	mux.HandleFunc("/api/group/{group_id}", groupHandler.GroupDetails)
	mux.HandleFunc("/api/group/create/post", groupHandler.GroupCreatePost)
	mux.HandleFunc("/api/group/{group_id}/post/", groupHandler.GroupPosts)
	mux.HandleFunc("/api/group/{group_id}/delete", groupHandler.GroupDelete)
	mux.HandleFunc("/api/group/{group_id}/request/", groupHandler.GroupRequest)
	mux.HandleFunc("/api/group/{group_id}/response", groupHandler.GroupResponse)
	mux.HandleFunc("/api/group/{group_id}/leave", groupHandler.GroupeLeave)
	mux.HandleFunc("/api/join/{group_id}/", groupHandler.JoinGroup)

	mux.HandleFunc("/api/group/createEvent", groupHandler.CreateEvent)
	mux.HandleFunc("/api/group/{group_id}/event/", groupHandler.Event)
	mux.HandleFunc("/api/group/{group_id}/event/response", groupHandler.EventResponse)




	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		utils.OpenHtml("index.html", w, "")
	})
}
