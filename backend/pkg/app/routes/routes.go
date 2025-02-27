package routes

import (
	"net/http"

	"blank/pkg/app/handlers"
	"blank/pkg/app/middleware"
	"blank/pkg/app/utils"
)

func SetupRoutes(mux *http.ServeMux,
	authHandler *handlers.AuthHandler,
	postHandler *handlers.PostHandler,
	reactHandler *handlers.ReactHandler,
	authMiddleware *middleware.AuthMiddleware,
	messageHnadler *handlers.MessageHandler,
	userHandler *handlers.UserHandler,
	groupHandler *handlers.GroupHandler,
	followHandler *handlers.FollowHandler,
	commentHandler *handlers.CommentHandler,
	webSocketHandler *handlers.WebSocketHandler,
) {
	mux.HandleFunc("/static/", utils.SetupStaticFilesHandlers)
	mux.HandleFunc("/api/logout", authHandler.HandleLogout)
	mux.HandleFunc("/api/register", authHandler.HandleRegister)
	mux.HandleFunc("/api/login", authHandler.HandleLogin)
	mux.HandleFunc("/api/integrity", authHandler.UserIntegrity)
	mux.HandleFunc("/storage/avatars/{avatar}", handlers.ServeImages)

	// user routes
	mux.HandleFunc("/api/user-info/{id}", userHandler.InfoGetter)
	mux.HandleFunc("/api/authenticated-user", userHandler.AuthenticatedUser)
	mux.HandleFunc("/api/user-update-info", userHandler.UpdateUserInfo)
	mux.HandleFunc("/api/searchusers", userHandler.SearchUsers)
	mux.HandleFunc("/api/user-posts/{id}/", postHandler.PostsByUser)

	// comments routes
	mux.HandleFunc("/api/comment/{post_id}/", commentHandler.CommentsGetter)
	mux.HandleFunc("/api/comment/create", commentHandler.CommentSaver)
	mux.HandleFunc("/api/comment/{comment_id}/like/", commentHandler.CommentLiker)

	mux.HandleFunc("/api/posts/", postHandler.Posts)
	mux.HandleFunc("/api/createpost", postHandler.PostSaver)
	mux.HandleFunc("/api/reacts", reactHandler.React)

	mux.HandleFunc("/api/requestfollow", followHandler.RequestFollow)
	mux.HandleFunc("/api/acceptfollow", followHandler.AcceptFollow)
	mux.HandleFunc("/api/refusefollow", followHandler.RefuseFollow)
	mux.HandleFunc("/api/deletefollowing", followHandler.DeleteFollowing)
	mux.HandleFunc("/api/deletefollower", followHandler.DeleteFollower)
	mux.HandleFunc("/api/followerlist", followHandler.FollowerList)
	mux.HandleFunc("/api/followinglist", followHandler.FollowingList)

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
	
	// message handler
	mux.HandleFunc("/api/chat/contacts", messageHnadler.GetContactUsers)
	mux.HandleFunc("/api/chat/{user_id}", messageHnadler.GetUserMessages)
	mux.HandleFunc("/api/chat/markAsRead/{user_id}", messageHnadler.MarkMessagesAsSeen)

	// WebSocket handler
	mux.HandleFunc("/ws", webSocketHandler.Connect)

	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/" {
			utils.SendResponses(w, http.StatusNotFound, "Page Not Found", nil)
			return
		}
		utils.OpenHtml("index.html", w, "")
	})
}
