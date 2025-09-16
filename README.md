
# FileVault Backend

A modern, production-grade backend built with Go, featuring:

- **Modular architecture** (controllers, services, servicesImpl, repositories)
- **Service interface pattern**: interfaces in `services/`, implementations in `servicesImpl/`, used by controllers
- **Environment-driven config** (Viper, .env)
- **Structured logging** (Zap, request ID tracing)
- **Secure authentication** (bcrypt, JWT)
- **PostgreSQL integration**
- **RESTful API** with Swagger docs
- **File upload & metadata**: SHA256-based storage, metadata in DB

---

## System Architecture

```mermaid
flowchart TD
    subgraph API Layer
        A[HTTP Request]
        B[Controllers]
    end
    subgraph Business Logic
        C[Service Interfaces]
        F[Service Implementations]
    end
    subgraph Data Layer
        D[Repositories]
        E[(PostgreSQL)]
    end
    A --> B --> C --> F --> D --> E
```

---


## Key Features

- **Authentication**: Register & login endpoints with JWT issuance
- **Interfaces**: Service & repository interfaces for testability
- **Service Implementation**: All business logic in `servicesImpl/`, interfaces in `services/`, used by controllers
- **File Upload**: Modular file upload, SHA256-named files, metadata stored in DB
- **File Metadata**: Uses a `FileRepo` struct and interface for DB operations, following the same pattern as authentication
- **Analytics**: Storage analytics endpoint aggregates file counts and deduplication savings using `reference_id` and `reference_count` from the metadata table
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
│   ├── controllers/      # HTTP handlers only
│   ├── dto/              # Data transfer objects
│   ├── repos/            # DB access logic
│   ├── routers/          # Route registration
│   ├── services/         # Service interfaces
│   ├── servicesImpl/     # Service implementations
│   └── utils/            # Helpers, config, logging
└── docs/
```

---



## API Endpoints

### Authentication
- `POST /api/v1/auth/register` — Register new user
- `POST /api/v1/auth/login` — Login and get JWT

### File Upload & Metadata
- `POST /upload` — Upload a file
- `POST /upload-meta` — Upload file with metadata
- `GET /path/download?path=...` — Download file by path
- `GET /path/view?path=...` — View file inline in browser

### Analytics
- `GET /file/storage/analytics` — Get storage analytics (unique files, deduplication savings, etc.)

### Documentation
- `GET /api/docs/` — Swagger API documentation

---


## Database Schema

```sql
CREATE TABLE file_metadata (
    id SERIAL PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    mime_type VARCHAR(128) NOT NULL,
    sha256 VARCHAR(64) NOT NULL,
    path TEXT NOT NULL,
    reference_id VARCHAR(64) NOT NULL,
    reference_count INT DEFAULT 1,
    file_size FLOAT NOT NULL
);
```

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
