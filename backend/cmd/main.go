package main

import (
	"fmt"
	"log"
	"net/http"

	"real-time-forum/internal"
	"real-time-forum/internal/database"
	"real-time-forum/internal/middleware"
	"real-time-forum/internal/routes"
	"real-time-forum/internal/utils"
)

func main() {
	db, err := database.InitDB("server_forum.db")
	if err != nil {
		log.Fatalf("error in DB : %v", err)
		return
	}

	err = database.RunMigrations(db)
	if err != nil {
		log.Fatalf("Error running migrations: %v", err)
		return
	}

	err = database.InsertDefaultCategories(db)
	if err != nil {
		log.Fatalf("error inserting default categories: %v", err)
		return
	}

	defer db.Close()

	userRepo, categoryRepo, postRepo, commentRepo, likeRepo, sessionRepo, messageRepo := internal.InitRepositories(db)

	authService, postService, categoryService, commentService, likeService, sessionService, messageService := internal.InitServices(userRepo,
		postRepo,
		categoryRepo,
		commentRepo,
		likeRepo,
		sessionRepo,
		messageRepo)

	authMiddleware := &middleware.AuthMiddleware{AuthService: authService, SessionService: sessionService}

	authHandler, postHandler, likeHandler, MessageHandler := internal.InitHandlers(authService,
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
