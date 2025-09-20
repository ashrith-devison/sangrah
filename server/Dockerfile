
FROM golang:1.25.1-alpine AS builder
WORKDIR /app
COPY go.mod ./
RUN go mod download
COPY . .
RUN go build -o filevault-backend main.go

FROM alpine:latest
WORKDIR /app
COPY --from=builder /app/filevault-backend .
RUN mkdir storage
COPY .env .env
EXPOSE 8080
CMD ["./filevault-backend"]
