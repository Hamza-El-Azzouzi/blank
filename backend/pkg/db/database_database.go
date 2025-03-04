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

type foreignKeyConnector struct {
	dsn    string
	driver driver.Driver
}

func (c *foreignKeyConnector) Connect(ctx context.Context) (driver.Conn, error) {
	conn, err := c.driver.Open(c.dsn)
	if err != nil {
		return nil, err
	}
	execer, ok := conn.(driver.ExecerContext)
	if !ok {
		return nil, fmt.Errorf("connection does not implement ExecerContext")
	}
	_, err = execer.ExecContext(ctx, "PRAGMA foreign_keys = ON;", nil)
	if err != nil {
		return nil, fmt.Errorf("failed to enable foreign keys: %w", err)
	}
	return conn, nil
}

func (c *foreignKeyConnector) Driver() driver.Driver {
	return c.driver
}

func InitDB(dataSourceName string) (*sql.DB, error) {
	connector := &foreignKeyConnector{
		dsn:    dataSourceName,
		driver: &sqlite3.SQLiteDriver{},
	}
	db := sql.OpenDB(connector) 
	
	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	var foreignKeysEnabled int
	if err := db.QueryRow("PRAGMA foreign_keys;").Scan(&foreignKeysEnabled); err != nil {
		return nil, fmt.Errorf("failed to check foreign keys: %w", err)
	}

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