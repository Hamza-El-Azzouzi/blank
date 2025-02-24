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
	*repositories.GroupRepository,
	*repositories.FollowRepositorie,
) {
	return &repositories.UserRepository{DB: db},
		&repositories.PostRepository{DB: db},
		&repositories.CommentRepositorie{DB: db},
		&repositories.ReactReposetorie{DB: db},
		&repositories.SessionsRepositorie{DB: db},
		&repositories.MessageRepository{DB: db},
		&repositories.GroupRepository{DB: db},
		&repositories.FollowRepositorie{DB: db}
}

func InitServices(userRepo *repositories.UserRepository,
	postRepo *repositories.PostRepository,
	commentRepo *repositories.CommentRepositorie,
	reactRepo *repositories.ReactReposetorie,
	sessionRepo *repositories.SessionsRepositorie,
	messageRepo *repositories.MessageRepository,
	groupRepo *repositories.GroupRepository,
	followRepo *repositories.FollowRepositorie) (*services.AuthService,
	*services.PostService,
	*services.CommentService,
	*services.ReactService,
	*services.SessionService,
	*services.MessageService,
	*services.UserService,
	*services.GroupService,
	*services.FollowService,
) {
	return &services.AuthService{UserRepo: userRepo, MessageRepo: messageRepo},
		&services.PostService{PostRepo: postRepo, UserRepo: userRepo},
		&services.CommentService{CommentRepo: commentRepo, PostRepo: postRepo},
		&services.ReactService{ReactRepo: reactRepo, PostRepo: postRepo, CommentRepo: commentRepo},
		&services.SessionService{SessionRepo: sessionRepo},
		&services.MessageService{MessageRepo: messageRepo, UserRepo: userRepo},
		&services.UserService{UserRepo: userRepo},
		&services.GroupService{GroupRepo: groupRepo},
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
	groupService *services.GroupService,
	followService *services.FollowService) (*handlers.AuthHandler,
	*handlers.PostHandler,
	*handlers.ReactHandler,
	*handlers.MessageHandler,
	*handlers.UserHandler,
	*handlers.GroupHandler,
	*handlers.CommentHandler,
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
		GroupService: groupService,
	}

	followHandler := &handlers.FollowHandler{
		FollowService: followService,
		UserService:   userService,
	}
	return authHandler, postHandler, reactHandler, MessageHandler, userHandler, groupHandler, commentHandler, followHandler
}
