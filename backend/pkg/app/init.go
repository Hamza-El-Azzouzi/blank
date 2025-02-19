package app

import (
	"database/sql"
	"net/http"

	"blank/pkg/app/handlers"
	"blank/pkg/app/middleware"
	"blank/pkg/app/models"
	"blank/pkg/app/repositories"
	"blank/pkg/app/services"

	"github.com/gorilla/websocket"
)

func InitRepositories(db *sql.DB) (*repositories.UserRepository,
	*repositories.PostRepository,
	*repositories.CommentRepositorie,
	*repositories.ReactReposetorie,
	*repositories.SessionsRepositorie,
	*repositories.MessageRepository,
	*repositories.FollowRepositorie,
) {
	return &repositories.UserRepository{DB: db},
		&repositories.PostRepository{DB: db},
		&repositories.CommentRepositorie{DB: db},
		&repositories.ReactReposetorie{DB: db},
		&repositories.SessionsRepositorie{DB: db},
		&repositories.MessageRepository{DB: db},
		&repositories.FollowRepositorie{DB: db}
}

func InitServices(userRepo *repositories.UserRepository,
	postRepo *repositories.PostRepository,
	commentRepo *repositories.CommentRepositorie,
	reactRepo *repositories.ReactReposetorie,
	sessionRepo *repositories.SessionsRepositorie,
	messageRepo *repositories.MessageRepository,
	followRepo *repositories.FollowRepositorie) (*services.AuthService,
	*services.PostService,
	*services.CommentService,
	*services.ReactService,
	*services.SessionService,
	*services.MessageService,
	*services.UserService,
	*services.FollowService,
) {
	return &services.AuthService{UserRepo: userRepo, MessageRepo: messageRepo},
		&services.PostService{PostRepo: postRepo},
		&services.CommentService{CommentRepo: commentRepo, PostRepo: postRepo},
		&services.ReactService{ReactRepo: reactRepo, PostRepo: postRepo, CommentRepo: commentRepo},
		&services.SessionService{SessionRepo: sessionRepo},
		&services.MessageService{MessageRepo: messageRepo, UserRepo: userRepo},
		&services.UserService{UserRepo: userRepo},
		&services.FollowService{FollowRepo: followRepo, UserRepo: userRepo}
}

func InitHandlers(authService *services.AuthService,
	postService *services.PostService,
	commentService *services.CommentService,
	reactService *services.ReactService,
	sessionService *services.SessionService,
	authMiddleware *middleware.AuthMiddleware,
	messageService *services.MessageService,
	userService *services.UserService,
	followService *services.FollowService) (*handlers.AuthHandler,
	*handlers.PostHandler,
	*handlers.ReactHandler,
	*handlers.MessageHandler,
	*handlers.UserHandler,
	*handlers.FollowHandler,
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
	reactHandler := &handlers.ReactHandler{
		ReactService: reactService,
	}
	userHandler := &handlers.UserHandler{
		UserService: userService,
	}

	followHandler := &handlers.FollowHandler{
		FollowService: followService,
		UserService:   userService,
	}
	return authHandler, postHandler, reactHandler, MessageHandler, userHandler, followHandler
}
