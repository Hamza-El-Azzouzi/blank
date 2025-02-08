package main

import (
	"fmt"
	"log"
	"net/http"

	"blank/pkg/app"
	"blank/pkg/db"
	"blank/pkg/app/middleware"
	"blank/pkg/app/routes"
	"blank/pkg/app/utils"
)

func main() {
	database, err := db.InitDB("server_forum.db")
	if err != nil {
		log.Fatalf("error in DB : %v", err)
		return
	}

	// err = db.RunMigrations(database)
	// if err != nil {
	// 	log.Fatalf("Error running migrations: %v", err)
	// 	return
	// }

	// err = db.InsertDefaultCategories(database)
	// if err != nil {
	// 	log.Fatalf("error inserting default categories: %v", err)
	// 	return
	// }

	defer database.Close()

	userRepo, categoryRepo, postRepo, commentRepo, likeRepo, sessionRepo, messageRepo := app.InitRepositories(database)

	authService, postService, categoryService, commentService, likeService, sessionService, messageService := app.InitServices(userRepo,
		postRepo,
		categoryRepo,
		commentRepo,
		likeRepo,
		sessionRepo,
		messageRepo)

	authMiddleware := &middleware.AuthMiddleware{AuthService: authService, SessionService: sessionService}

	authHandler, postHandler, likeHandler, MessageHandler := app.InitHandlers(authService,
		postService,
		categoryService,
		commentService,
		likeService,
		sessionService,
		authMiddleware,
		messageService)

	cleaner := &utils.Cleaner{SessionService: sessionService}

	go cleaner.CleanupExpiredSessions()

	mux := http.NewServeMux()

	routes.SetupRoutes(mux, authHandler, postHandler, likeHandler, authMiddleware, MessageHandler)

	fmt.Println("Starting the forum server...\nWelcome http://127.0.0.1:1414/")

	log.Fatal(http.ListenAndServe("127.0.0.1:1414", nil))
}
