package db

import (
	"context"
	"database/sql"
	"database/sql/driver"
	"fmt"
	"log"

	"github.com/mattn/go-sqlite3"
	migrate "github.com/rubenv/sql-migrate"
)

// Custom connector to enable foreign keys for every new connection
type foreignKeyConnector struct {
	dsn    string
	driver driver.Driver
}

func (c *foreignKeyConnector) Connect(ctx context.Context) (driver.Conn, error) {
	conn, err := c.driver.Open(c.dsn)
	if err != nil {
		return nil, err
	}
	// Enable foreign keys for the new connection
	_, err = conn.(driver.ExecerContext).ExecContext(ctx, "PRAGMA foreign_keys = ON;", nil)
	if err != nil {
		return nil, fmt.Errorf("failed to enable foreign keys: %w", err)
	}
	return conn, nil
}

func (c *foreignKeyConnector) Driver() driver.Driver {
	return c.driver
}

func InitDB(dataSourceName string) (*sql.DB, error) {
	// Create a custom connector
	connector := &foreignKeyConnector{
		dsn:    dataSourceName,
		driver: &sqlite3.SQLiteDriver{},
	}

	// Open the database using the custom connector
	db := sql.OpenDB(connector)

	// Configure the connection pool
	db.SetMaxOpenConns(10)    // Set the maximum number of open connections
	db.SetMaxIdleConns(10)    // Set the maximum number of idle connections
	db.SetConnMaxLifetime(0)  // Connections are reused indefinitely
	db.SetConnMaxIdleTime(0)  // Idle connections are kept open indefinitely

	// Ping the database to ensure it's reachable
	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	// Verify foreign keys are enabled
	var foreignKeysEnabled int
	if err := db.QueryRow("PRAGMA foreign_keys;").Scan(&foreignKeysEnabled); err != nil {
		return nil, fmt.Errorf("failed to check foreign keys: %w", err)
	}
	fmt.Println("Foreign keys enabled:", foreignKeysEnabled) // Should print "1" if enabled

	// Apply migrations
	migrations := &migrate.FileMigrationSource{
		Dir: "./pkg/db/migrations",
	}
	n, err := migrate.Exec(db, "sqlite3", migrations, migrate.Up)
	if err != nil {
		return nil, fmt.Errorf("failed to apply migrations: %w", err)
	}
	log.Printf("Applied %d migrations!\n", n)

	return db, nil
}