# FileVault Backend

A modern, production-grade authentication backend built with Go, featuring:

- **Modular architecture** (controllers, services, repositories)
- **Environment-driven config** (Viper, .env)
- **Structured logging** (Zap, request ID tracing)
- **Secure authentication** (bcrypt, JWT)
- **PostgreSQL integration**
- **RESTful API** with Swagger docs

---

## System Architecture

```mermaid
flowchart TD
    subgraph API Layer
        A[HTTP Request]
        B[Controllers]
    end
    subgraph Business Logic
        C[Services]
    end
    subgraph Data Layer
        D[Repositories]
        E[(PostgreSQL)]
    end
    A --> B --> C --> D --> E
```

---

## Key Features

- **Authentication**: Register & login endpoints with JWT issuance
- **Interfaces**: Service & repository interfaces for testability
- **Config Loader**: Viper-based, loads from .env and environment
- **Logging**: Zap logger with request ID for traceability
- **Error Handling**: Proper HTTP status codes (409 for conflicts, etc.)
- **API Docs**: Swagger UI at `/api/docs/`

---

## Quick Start

1. **Clone the repo**
2. **Set up `.env`**:
   ```env
   PORT=8080
   DB_URL=postgres://user:pass@localhost:5432/filevault?sslmode=disable
   JWT_SECRET=your_jwt_secret
   ```
3. **Run the server**:
   ```sh
   go run main.go
   ```
4. **Access API docs**: [http://localhost:8080/api/docs/](http://localhost:8080/api/docs/)

---

## Folder Structure

```
backend/
├── main.go
├── docker-compose.yaml
├── Dockerfile
├── go.mod
├── src/
│   ├── controllers/
│   ├── dto/
│   ├── repos/
│   ├── routers/
│   ├── services/
│   ├── services-cat/
│   └── utils/
└── docs/
```

---


## API Endpoints

### Authentication
- `POST /api/v1/auth/register` — Register new user
- `POST /api/v1/auth/login` — Login and get JWT

### Documentation
- `GET /api/docs/` — Swagger API documentation

---

## Tech Stack

- **Go**
- **PostgreSQL**
- **Viper** (config)
- **Zap** (logging)
- **bcrypt** (password hashing)
- **JWT** (auth tokens)
- **Swagger** (API docs)

---

## License

MIT
