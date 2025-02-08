package db

import (
	"database/sql"
	"log"

	_ "github.com/mattn/go-sqlite3"
	migrate "github.com/rubenv/sql-migrate"
)

func InitDB(dataSourceName string) (*sql.DB, error) {
	db, err := sql.Open("sqlite3", dataSourceName)
	if err != nil {
		return nil, err
	}
	err = db.Ping()
	if err != nil {
		return nil, err
	}

	migrations := &migrate.FileMigrationSource{
		Dir: "./pkg/db/migrations",
	}
	n, err := migrate.Exec(db, "sqlite3", migrations, migrate.Up)
	if err != nil {
		log.Fatal(err)
	}
	seeders := &migrate.FileMigrationSource{
		Dir: "./pkg/db/seeders",
	}
	ns, err := migrate.Exec(db, "sqlite3", seeders, migrate.Up)
	if err != nil {
		log.Fatal(err)
	}

	
	log.Printf("Applied %d migrations!\n", ns)
	log.Printf("Applied %d migrations!\n", n)
	return db, nil
}
