package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"blank/pkg/app"
	"blank/pkg/app/middleware"
	"blank/pkg/app/routes"

	"blank/pkg/db"
)

func main() {
	os.Setenv("FRONT_END_DOMAIN", "http://127.0.0.1:3000")
	os.Setenv("DOMAIN", "127.0.0.1")
	database, err := db.InitDB("./pkg/db/blank.db")
	if err != nil {
		log.Fatalf("error in DB : %v", err)
		return
	}

	defer database.Close()

	userRepo, categoryRepo, postRepo, commentRepo, likeRepo, sessionRepo, messageRepo := app.InitRepositories(database)

	authService, postService, categoryService, commentService, likeService, sessionService, messageService, userService := app.InitServices(userRepo,
		postRepo,
		categoryRepo,
		commentRepo,
		likeRepo,
		sessionRepo,
		messageRepo)

	authMiddleware := &middleware.AuthMiddleware{AuthService: authService, SessionService: sessionService}

	authHandler, postHandler, likeHandler, MessageHandler, userHandler := app.InitHandlers(authService,
		postService,
		categoryService,
		commentService,
		likeService,
		sessionService,
		authMiddleware,
		messageService,
		userService)

	// cleaner := &utils.Cleaner{SessionService: sessionService}

	// go cleaner.CleanupExpiredSessions()
	
	mux := http.NewServeMux()
	protectedMux := authMiddleware.Protect(mux)
	routes.SetupRoutes(mux, authHandler, postHandler, likeHandler, authMiddleware, MessageHandler, userHandler)

	fmt.Println("Starting the forum server...\nWelcome http://127.0.0.1:1414/")

	log.Fatal(http.ListenAndServe("127.0.0.1:1414", middleware.RateLimitMiddleware(middleware.CheckCORS(protectedMux))))
}
