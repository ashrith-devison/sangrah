
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


## Dependency Injection & Service Pattern

This backend uses a clean dependency injection pattern for modularity and testability:

```mermaid
flowchart TD
    subgraph Controllers
        A[HTTP Request]
        B[Controller]
    end
    subgraph Service Layer
        C[Service Interface]
        D[Service Implementation]
    end
    subgraph Data Layer
        E[Repository]
        F[(PostgreSQL)]
    end
    A --> B --> C
    C --> D
    D --> E
    E --> F
```

- **Service Interfaces** (`src/services/`): Define business logic contracts (e.g., `FileServiceInterface`, `AuthServiceInterface`).
- **Service Implementations** (`src/servicesImpl/`): Concrete logic, injected with dependencies (e.g., DB repos, config, logger).
- **Controllers** (`src/controllers/`): Accept HTTP requests, depend only on service interfaces, not implementations.
- **Repositories** (`src/repos/`): Encapsulate all database access, injected into services.

### How Dependency Injection Works

1. **Interfaces**: Each service exposes an interface in `services/`.
2. **Implementations**: The actual logic lives in `servicesImpl/`, which takes dependencies (repos, config, etc.) as constructor arguments.
3. **Controller Wiring**: Controllers declare their dependencies as interfaces, and are wired up with concrete implementations at startup.
4. **Testing**: You can swap out real implementations for mocks in tests, since controllers only depend on interfaces.

#### Example (File Upload)

```go
// services/file.go
type FileServiceInterface interface {
    UploadFile(file dto.FileUploadRequest) error
}

// servicesImpl/file.go
type FileService struct {
    repo *repos.FileRepo
}
func (s *FileService) UploadFile(file dto.FileUploadRequest) error {
    // business logic
}

// controllers/file.controllers.go
var fileService services.FileServiceInterface = &servicesImpl.FileService{repo: repos.NewFileRepo(db)}
```

#### Benefits
- **Loose coupling**: Controllers don’t care about implementation details.
- **Testability**: Swap in mocks for unit tests.
- **Extensibility**: Add new service implementations without changing controllers.
- **Single Responsibility**: Each layer has a clear purpose.

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


## System Design: Low-Level Design (LLD)

### 1. Layered Architecture

- **Controllers**: Handle HTTP requests, validate input, and call service interfaces.
- **Services (Interfaces & Implementations)**: Business logic, orchestrate operations, enforce rules.
- **Repositories**: Direct database access, CRUD operations, query building.
- **DTOs**: Data transfer objects for request/response payloads.
- **Utils**: Helpers for logging, config, error handling, JWT, etc.

### 2. Key Components

#### Controllers
- `AuthController`
- `FileController`
- `LoggerController`

#### Services
- `AuthServiceInterface` / `AuthService`
- `FileServiceInterface` / `FileService`

#### Repositories
- `AuthRepo`
- `FileRepo`

#### DTOs
- `AuthDTO`
- `FileUploadRequest`
- `FileShareRequest`
- `PublicShareRequest`

#### Utils
- `apiError.go`
- `apiResponse.go`
- `jwt.conf.go`
- `postgres.conf.go`

### 3. Data Flow Example: File Upload

1. **Request**: User sends a file upload request to `/upload`.
2. **Controller**: `FileController` receives the request, validates input.
3. **Service**: Calls `FileService.UploadFile`, which:
   - Validates uploader exists.
   - Computes SHA256 hash for deduplication.
   - Persists metadata via `FileRepo`.
   - Stores file in storage.
4. **Repository**: `FileRepo` inserts metadata into `file_metadata` table.
5. **Response**: Controller returns success or error via standardized API response.

### 4. Class/Struct Relationships

```go
// src/services/file.go
type FileServiceInterface interface {
    UploadFile(file dto.FileUploadRequest) error
    // ...other methods
}

// src/servicesImpl/file.go
type FileService struct {
    repo *repos.FileRepo
}
func (s *FileService) UploadFile(file dto.FileUploadRequest) error {
    // business logic
}

// src/controllers/file.controllers.go
type FileController struct {
    service services.FileServiceInterface
}
```

### 5. Database Schema (File Metadata)

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

### 6. Sequence Diagram (File Upload)

```mermaid
sequenceDiagram
    participant User
    participant Controller
    participant Service
    participant Repo
    participant DB

    User->>Controller: POST /upload (file, metadata)
    Controller->>Service: UploadFile(request)
    Service->>Repo: SaveMetadata(file)
    Repo->>DB: INSERT INTO file_metadata
    Service->>Service: Store file in storage
    Controller-->>User: Success/Error response
```


## Key Features

- **Authentication**: Register & login endpoints with JWT issuance
- **Interfaces**: Service & repository interfaces for testability
- **Service Implementation**: All business logic in `servicesImpl/`, interfaces in `services/`, used by controllers
- **File Upload**: Modular file upload, SHA256-named files, metadata stored in DB
**File Metadata**: Uses a `FileRepo` struct and interface for DB operations, following the same pattern as authentication
**Uploader Validation**: File uploads require the uploader to exist in the users table. Uploader checks are case-insensitive and trimmed of whitespace for reliability.
**Public Sharing**: Files can be shared publicly via a generated token and link. When a file is made public, the `is_public` flag in the `user_files` table is set to `true` for that file and user, making it discoverable as public.
**Analytics**: Storage analytics endpoint aggregates file counts and deduplication savings using `reference_id` and `reference_count` from the metadata table
**Config Loader**: Viper-based, loads from .env and environment
**Logging**: Zap logger with request ID for traceability
**Error Handling**: Proper HTTP status codes (400 for bad request, 409 for conflicts, etc.)
**API Docs**: Swagger UI at `/api/docs/`

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
│   ├── services/         # Service interfaces (business logic contracts)
│   ├── servicesImpl/     # Service implementations (actual logic)
│   └── utils/            # Helpers, config, logging
├── storage/              # Deduplicated file storage (SHA256-named files)
├── tmp/                  # Temporary files (uploads, processing)
└── docs/                 # API docs, Swagger, etc.
```

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
        G[Storage Service]
    end
    subgraph Data Layer
        D[Repositories]
        E[(PostgreSQL)]
        H[File Storage]
    end
    A --> B --> C --> F
    F --> D
    F --> G
    D --> E
    G --> H
```
* The Storage Service layer handles all file operations (save, retrieve, delete) and abstracts physical storage from business logic.
* Public sharing and deduplication are managed at the service and repo layers, with metadata and flags in the database.
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

### Public Sharing
- `POST /public-share` — Share a file publicly, generates a token and public link. Also sets `is_public=true` for the file in `user_files`.
- `GET /public/view?token=...` — Access a publicly shared file via token.

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
