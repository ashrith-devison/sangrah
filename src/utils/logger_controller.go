package utils

import (
	"log"
	"os"
)

var (
	infoLogger  *log.Logger
	warnLogger  *log.Logger
	errorLogger *log.Logger
)

func init() {
	file, err := os.OpenFile("footprint.log", os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0666)
	if err != nil {
		log.Fatalf("Failed to open log file: %v", err)
	}
	infoLogger = log.New(file, "INFO: ", log.Ldate|log.Ltime|log.Lshortfile)
	warnLogger = log.New(file, "WARN: ", log.Ldate|log.Ltime|log.Lshortfile)
	errorLogger = log.New(file, "ERROR: ", log.Ldate|log.Ltime|log.Lshortfile)
}

func Info(msg string, args ...interface{}) {
	infoLogger.Printf(msg, args...)
}

func Warn(msg string, args ...interface{}) {
	warnLogger.Printf(msg, args...)
}

func Error(msg string, args ...interface{}) {
	errorLogger.Printf(msg, args...)
}
