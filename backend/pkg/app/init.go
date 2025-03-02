package app

import (
	"database/sql"
	"net/http"

	"blank/pkg/app/handlers"
	"blank/pkg/app/middleware"
	"blank/pkg/app/models"
	"blank/pkg/app/repositories"
	"blank/pkg/app/services"

	"github.com/gofrs/uuid/v5"
	"github.com/gorilla/websocket"
)

func InitRepositories(db *sql.DB) (*repositories.UserRepository,
	*repositories.PostRepository,
	*repositories.CommentRepositorie,
	*repositories.ReactReposetorie,
	*repositories.SessionsRepositorie,
	*repositories.MessageRepository,
	*repositories.GroupRepository,
	*repositories.FollowRepositorie,
	*repositories.NotificationRepository,
) {
	return &repositories.UserRepository{DB: db},
		&repositories.PostRepository{DB: db},
		&repositories.CommentRepositorie{DB: db},
		&repositories.ReactReposetorie{DB: db},
		&repositories.SessionsRepositorie{DB: db},
		&repositories.MessageRepository{DB: db},
		&repositories.GroupRepository{DB: db},
		&repositories.FollowRepositorie{DB: db},
		&repositories.NotificationRepository{DB: db}
}

func InitServices(userRepo *repositories.UserRepository,
	postRepo *repositories.PostRepository,
	commentRepo *repositories.CommentRepositorie,
	reactRepo *repositories.ReactReposetorie,
	sessionRepo *repositories.SessionsRepositorie,
	messageRepo *repositories.MessageRepository,
	groupRepo *repositories.GroupRepository,
	notificationRepo *repositories.NotificationRepository,
	followRepo *repositories.FollowRepositorie) (*services.AuthService,
	*services.PostService,
	*services.CommentService,
	*services.ReactService,
	*services.SessionService,
	*services.MessageService,
	*services.UserService,
	*services.GroupService,
	*services.FollowService,
	*services.NotificationService,
	*services.WebSocketService,
) {
	return &services.AuthService{UserRepo: userRepo, MessageRepo: messageRepo},
		&services.PostService{PostRepo: postRepo, UserRepo: userRepo},
		&services.CommentService{CommentRepo: commentRepo, PostRepo: postRepo},
		&services.ReactService{ReactRepo: reactRepo, PostRepo: postRepo, CommentRepo: commentRepo, GroupRepo: groupRepo},
		&services.SessionService{SessionRepo: sessionRepo},
		&services.MessageService{MessageRepo: messageRepo, UserRepo: userRepo},
		&services.UserService{UserRepo: userRepo},
		&services.GroupService{GroupRepo: groupRepo},
		&services.FollowService{FollowRepo: followRepo, UserRepo: userRepo},
		&services.NotificationService{NotificationRepo: notificationRepo},
		&services.WebSocketService{
			UserRepo:         userRepo,
			MessageRepo:      messageRepo,
			GroupRepo:        groupRepo,
			NotificationRepo: notificationRepo,
			ConnectedUsers:   make(map[uuid.UUID]*models.ConnectedUser),
		}
}

func InitHandlers(authService *services.AuthService,
	postService *services.PostService,
	commentService *services.CommentService,
	reactService *services.ReactService,
	sessionService *services.SessionService,
	authMiddleware *middleware.AuthMiddleware,
	messageService *services.MessageService,
	userService *services.UserService,
	groupService *services.GroupService,
	followService *services.FollowService,
	notificationService *services.NotificationService,
	webSocketService *services.WebSocketService) (*handlers.AuthHandler,
	*handlers.PostHandler,
	*handlers.ReactHandler,
	*handlers.MessageHandler,
	*handlers.UserHandler,
	*handlers.GroupHandler,
	*handlers.CommentHandler,
	*handlers.FollowHandler,
	*handlers.WebSocketHandler,
) {
	MessageHandler := &handlers.MessageHandler{
		MessageService: messageService,
		AuthService:    authService,
		SessionService: sessionService,
		Upgrader: websocket.Upgrader{
			CheckOrigin: func(r *http.Request) bool {
				return true
			},
		},
		Clients: map[string]*models.Client{},
	}
	authHandler := &handlers.AuthHandler{
		MessageHandler: MessageHandler,
		AuthService:    authService,
		AuthMidlaware:  authMiddleware,
		SessionService: sessionService,
	}
	postHandler := &handlers.PostHandler{
		AuthMidlaware:  authMiddleware,
		PostService:    postService,
		CommentService: commentService,
	}
	commentHandler := &handlers.CommentHandler{
		CommentService: commentService,
		PostService:    postService,
		UserService:    userService,
	}
	reactHandler := &handlers.ReactHandler{
		ReactService: reactService,
	}
	userHandler := &handlers.UserHandler{
		UserService:   userService,
		FollowService: followService,
	}
	groupHandler := &handlers.GroupHandler{
		GroupService:     groupService,
		UserService:      userService,
		WebSocketService: webSocketService,
	}

	followHandler := &handlers.FollowHandler{
		FollowService:    followService,
		UserService:      userService,
		WebSocketService: webSocketService,
	}

	websocketHandler := &handlers.WebSocketHandler{
		WebSocketService:    webSocketService,
		UserService:         userService,
		GroupService:        groupService,
		SessionService:      sessionService,
		NotificationService: notificationService,

		Upgrader: websocket.Upgrader{
			CheckOrigin: func(r *http.Request) bool {
				return true
			},
		},
	}

	return authHandler, postHandler, reactHandler, MessageHandler, userHandler, groupHandler, commentHandler, followHandler, websocketHandler
}
