package utils

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	_ "github.com/lib/pq"
)

// ConnectPostgres returns a live PostgreSQL DB connection using environment variables.
func ConnectPostgres() (*sql.DB, error) {
	connStr := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		os.Getenv("DB_HOST"),
		os.Getenv("DB_PORT"),
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_NAME"),
	)
	db, err := sql.Open("postgres", connStr)
	if err != nil {
		log.Printf("Error opening DB connection: %v", err)
		return nil, err
	}
	if err := db.Ping(); err != nil {
		log.Printf("Error pinging DB: %v", err)
		return nil, err
	}
	return db, nil
}

// QueryRow executes a query expected to return a single row and scans the result into scanDest.
func QueryRow(db *sql.DB, query string, scanDest []interface{}, args ...interface{}) error {
	row := db.QueryRow(query, args...)
	if err := row.Scan(scanDest...); err != nil {
		log.Printf("QueryRow scan error: %v", err)
		return err
	}
	return nil
}

// QueryRows executes a query that returns multiple rows and applies scanFunc to each row.
func QueryRows(db *sql.DB, query string, scanFunc func(*sql.Rows) error, args ...interface{}) error {
	rows, err := db.Query(query, args...)
	if err != nil {
		log.Printf("QueryRows error: %v", err)
		return err
	}
	defer rows.Close()
	for rows.Next() {
		if err := scanFunc(rows); err != nil {
			log.Printf("Row scan error: %v", err)
			return err
		}
	}
	if err := rows.Err(); err != nil {
		log.Printf("Rows error: %v", err)
		return err
	}
	return nil
}

// ExecQuery executes a query that does not return rows and returns affected row count.
func ExecQuery(db *sql.DB, query string, args ...interface{}) (int64, error) {
	result, err := db.Exec(query, args...)
	if err != nil {
		log.Printf("ExecQuery error: %v", err)
		return 0, err
	}
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		log.Printf("RowsAffected error: %v", err)
		return 0, err
	}
	return rowsAffected, nil
}
