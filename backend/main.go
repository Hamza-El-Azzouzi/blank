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

	userRepo, postRepo, commentRepo, likeRepo, sessionRepo, messageRepo, groupRepo, followRepo, notificationRepo := app.InitRepositories(database)

	authService, postService, commentService, likeService, sessionService, messageService, userService, groupService, followService, webSocketService := app.InitServices(userRepo,
		postRepo,
		commentRepo,
		likeRepo,
		sessionRepo,
		messageRepo,
		groupRepo,
		notificationRepo,
		followRepo)

	authMiddleware := &middleware.AuthMiddleware{AuthService: authService, SessionService: sessionService}

	authHandler, postHandler, likeHandler, MessageHandler, userHandler, groupHandler, commentHandler, followHandler, webSocketHandler := app.InitHandlers(authService,
		postService,
		commentService,
		likeService,
		sessionService,
		authMiddleware,
		messageService,
		userService,
		groupService,
		followService,
		webSocketService)

	mux := http.NewServeMux()
	protectedMux := authMiddleware.Protect(mux)

	routes.SetupRoutes(mux, authHandler, postHandler, likeHandler, authMiddleware, MessageHandler, userHandler, groupHandler, followHandler, commentHandler, webSocketHandler)

	fmt.Println("Starting the forum server...\nWelcome http://127.0.0.1:1414/")

	log.Fatal(http.ListenAndServe("0.0.0.0:1414", middleware.RateLimitMiddleware(middleware.CheckCORS(protectedMux))))
}
