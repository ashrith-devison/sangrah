package utils

import (
	"backend/src/config"
	"database/sql"
	"log"

	_ "github.com/lib/pq"
)

// ConnectPostgresWithConfig connects to Postgres using a provided config
func ConnectPostgresWithConfig(cfg *config.Config) (*sql.DB, error) {
	connStr := cfg.DBUrl
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

func ConnectPostgres() (*sql.DB, error) {
	cfg, err := config.LoadConfig()
	if err != nil {
		log.Printf("Error loading config: %v", err)
		return nil, err
	}
	connStr := cfg.DBUrl
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

func QueryRow(db *sql.DB, query string, scanDest []interface{}, args ...interface{}) error {
	row := db.QueryRow(query, args...)
	log.Printf("Executing QueryRow: %s with args: %v", query, args)
	log.Print(row)
	if err := row.Scan(scanDest...); err != nil {
		log.Printf("QueryRow scan error: %v", err)
		return err
	}
	return nil
}

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
