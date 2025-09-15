# syntax=docker/dockerfile:1

FROM golang:1.25.1-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN go build -o filevault-backend main.go

FROM alpine:latest
WORKDIR /app
COPY --from=builder /app/filevault-backend .
EXPOSE 8080
ENV PORT=8080
CMD ["./filevault-backend"]
