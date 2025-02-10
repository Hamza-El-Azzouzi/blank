package app

// backend/pkg/app/handlers/handlers_login.go
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
	*repositories.CategoryRepository,
	*repositories.PostRepository,
	*repositories.CommentRepositorie,
	*repositories.ReactReposetorie,
	*repositories.SessionsRepositorie,
	*repositories.MessageRepository,
) {
	return &repositories.UserRepository{DB: db},
		&repositories.CategoryRepository{DB: db},
		&repositories.PostRepository{DB: db},
		&repositories.CommentRepositorie{DB: db},
		&repositories.ReactReposetorie{DB: db},
		&repositories.SessionsRepositorie{DB: db},
		&repositories.MessageRepository{DB: db}
}

func InitServices(userRepo *repositories.UserRepository,
	postRepo *repositories.PostRepository,
	categoryRepo *repositories.CategoryRepository,
	commentRepo *repositories.CommentRepositorie,
	reactRepo *repositories.ReactReposetorie,
	sessionRepo *repositories.SessionsRepositorie,
	messageRepo *repositories.MessageRepository) (*services.AuthService,
	*services.PostService,
	*services.CategoryService,
	*services.CommentService,
	*services.ReactService,
	*services.SessionService,
	*services.MessageService,
	*services.UserService,
) {
	return &services.AuthService{UserRepo: userRepo, MessageRepo: messageRepo},
		&services.PostService{PostRepo: postRepo, CategoryRepo: categoryRepo},
		&services.CategoryService{CategorieRepo: categoryRepo},
		&services.CommentService{CommentRepo: commentRepo, PostRepo: postRepo},
		&services.ReactService{ReactRepo: reactRepo, PostRepo: postRepo, CommentRepo: commentRepo},
		&services.SessionService{SessionRepo: sessionRepo},
		&services.MessageService{MessageRepo: messageRepo, UserRepo: userRepo},
		&services.UserService{UserRepo: userRepo}
}

func InitHandlers(authService *services.AuthService,
	postService *services.PostService,
	categoryService *services.CategoryService,
	commentService *services.CommentService,
	reactService *services.ReactService,
	sessionService *services.SessionService,
	authMiddleware *middleware.AuthMiddleware,
	messageService *services.MessageService,
	userService *services.UserService) (*handlers.AuthHandler,
	*handlers.PostHandler,
	*handlers.ReactHandler,
	*handlers.MessageHandler,
	*handlers.UserHandler,
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
		AuthService:     authService,
		AuthMidlaware:   authMiddleware,
		CategoryService: categoryService,
		PostService:     postService,
		CommentService:  commentService,
		AuthHandler:     authHandler,
	}
	reactHandler := &handlers.ReactHandler{
		ReactService:  reactService,
		AuthMidlaware: authMiddleware,
	}
	userHandler := &handlers.UserHandler{
		UserService: userService,
	}

	return authHandler, postHandler, reactHandler, MessageHandler, userHandler
}
