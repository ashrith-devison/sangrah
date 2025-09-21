# 📁 FileVault Backend - Complete Manual

> A production-grade file management system built with Go, featuring secure authentication, deduplication, and comprehensive API documentation.

![Go Version](https://img.shields.io/badge/Go-1.21+-1e88e5?style=flat-square)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-43a047?style=flat-square)
![Swagger](https://img.shields.io/badge/Swagger-API_Docs-ffd600?style=flat-square)
![Docker](https://img.shields.io/badge/Docker-Ready-546e7a?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-616161?style=flat-square)
![Build Status](https://img.shields.io/badge/Build-Passing-43a047?style=flat-square)

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔐 **Secure Authentication** | JWT-based auth with bcrypt password hashing |
| 📁 **File Deduplication** | SHA-256 based deduplication saves storage space |
| 🔍 **Advanced Search** | Search files by name, MIME type, and metadata |
| 👥 **User Management** | Role-based access (user/admin) with permissions |
| 📊 **Analytics Dashboard** | Comprehensive usage stats and storage analytics |
| 🌐 **Public Sharing** | Token-based public file sharing |
| 🐳 **Docker Ready** | Containerized deployment with Docker Compose |
| 📚 **API Documentation** | Auto-generated Swagger docs |
| 🔄 **Real-time Sync** | Efficient file synchronization |

---

## � Recent Updates

### v1.2.0 - Enhanced Analytics
- ✅ Added physical vs logical file classification in admin stats
- ✅ Implemented space usage analytics with deduplication savings
- ✅ Fixed file extension handling for better consistency
- ✅ Improved error responses for database scan issues

### v1.1.0 - Security & Performance
- 🔒 Enhanced JWT authentication with secure token handling
- 📊 Added comprehensive storage analytics
- 🐛 Fixed MIME type detection for file uploads
- ⚡ Optimized database queries with proper indexing

---

## �📋 Table of Contents

### 🚀 Getting Started
- [Quick Start](#-quick-start)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)

### 🏗️ Architecture & Design
- [System Overview](#-system-overview)
- [Layered Architecture](#layered-architecture)
- [Dependency Injection Pattern](#dependency-injection-pattern)
- [Database Schema](#database-schema)
- [API Design](#api-design)

### 📚 API Reference
- [Authentication](#authentication)
- [File Management](#file-management)
- [Admin Panel](#admin-panel)
- [Analytics](#analytics)
- [Public Sharing](#public-sharing)

### 🔧 Development
- [Project Structure](#project-structure)
- [Key Components](#key-components)
- [Testing](#testing)
- [Deployment](#deployment)

### 🐛 Troubleshooting
- [Common Issues](#common-issues)
- [Debugging](#debugging)
- [Logs](#logs)

### 🤝 Contributing
- [Development Setup](#development-setup)
- [Code Style](#code-style)
- [Pull Requests](#pull-requests)

---

## 🚀 Quick Start

### Prerequisites
- **Go 1.21+** - [Download here](https://golang.org/dl/)
- **PostgreSQL 15+** - [Download here](https://postgresql.org/download/)
- **Docker & Docker Compose** (optional, for containerized deployment)

### Quick Setup Flow

```mermaid
flowchart TD
    A[📥 Clone Repository] --> B[📦 Install Dependencies]
    B --> C[⚙️ Configure Environment]
    C --> D[🐘 Setup Database]
    D --> E[🚀 Start Application]
    E --> F[📖 Access API Docs]

  style A fill:#1976d2,color:#fff
  style E fill:#388e3c,color:#fff
  style F fill:#ffd600,color:#222
```

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/filevault-backend.git
   cd filevault-backend
   ```

2. **Install dependencies**
   ```bash
   go mod download
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Run database migrations**
   ```bash
   # Using Docker
   docker-compose up -d postgres

   # Or manually create database and run migrations
   psql -U postgres -d filevaultdb -f data/migrations.sql
   ```

5. **Start the server**
   ```bash
   go run main.go
   ```

6. **Access the API**
   - **API Documentation**: http://localhost:8080/api/docs/
   - **Health Check**: http://localhost:8080/api/v1/health

---

## 🏗️ Architecture & Design

### System Overview

FileVault is a modern, scalable file management system designed with clean architecture principles. The system provides secure file storage with deduplication, user authentication, and comprehensive API access.

```mermaid
graph TB
    subgraph "Client Layer"
        A[📱 Web/Mobile Apps]
        B[🤖 API Clients]
    end

    subgraph "API Gateway"
        C[🌐 REST API]
        D[📖 Swagger Docs]
    end

    subgraph "Application Layer"
        E[🎛️ Controllers]
        F[⚙️ Services]
        G[📦 DTOs]
    end

    subgraph "Domain Layer"
        H[🧠 Business Logic]
        I[✅ Validation]
        J[🔐 Security]
    end

    subgraph "Infrastructure Layer"
        K[💾 Repositories]
        L[🐘 PostgreSQL]
        M[📁 File Storage]
        N[⚡ Cache/Redis]
    end

    A --> C
    B --> C
    C --> E
    E --> F
    F --> H
    H --> K
    K --> L
    K --> M
    F --> N

  style A fill:#1976d2,color:#fff
  style C fill:#7e57c2,color:#fff
  style E fill:#388e3c,color:#fff
  style H fill:#ffd600,color:#222
  style K fill:#616161,color:#fff
```

### Layered Architecture

FileVault follows a clean, layered architecture that separates concerns and enables maintainability:

#### 1. **Presentation Layer (Controllers)**
- HTTP request/response handling
- Input validation and sanitization
- Response formatting
- Error handling

#### 2. **Application Layer (Services)**
- Business logic orchestration
- Use case implementation
- Transaction management
- Cross-cutting concerns

#### 3. **Domain Layer (Entities & Value Objects)**
- Core business entities
- Business rules and invariants
- Domain services

#### 4. **Infrastructure Layer (Repositories & External Services)**
- Data persistence
- External API integrations
- File storage operations
- Caching and messaging

### Dependency Injection Pattern

FileVault uses a sophisticated dependency injection pattern for maximum testability and maintainability:

```mermaid
classDiagram
    class Controller {
        +service: ServiceInterface
        +HandleRequest()
    }

    class ServiceInterface {
        +<<interface>> BusinessMethod()
    }

    class ServiceImpl {
        +repo: Repository
        +config: Config
        +logger: Logger
        +BusinessMethod()
    }

    class Repository {
        +db: Database
        +FindById()
        +Save()
    }

    Controller --> ServiceInterface
    ServiceImpl ..|> ServiceInterface
    ServiceImpl --> Repository
```

#### Key Benefits:
- **Testability**: Easy mocking of dependencies
- **Flexibility**: Swap implementations without code changes
- **Maintainability**: Clear separation of concerns
- **Scalability**: Easy to add new features

### Database Schema

```sql
-- Users table for authentication
CREATE TABLE users (
    username VARCHAR(255) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- File metadata with deduplication support
CREATE TABLE file_metadata (
    sha256 VARCHAR(64) PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    mime_type VARCHAR(128) NOT NULL,
    path TEXT NOT NULL,
    reference_id VARCHAR(64) NOT NULL,
    reference_count INT DEFAULT 1,
    file_size FLOAT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User-file relationships and permissions
CREATE TABLE user_files (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL REFERENCES users(username) ON DELETE CASCADE,
    file_id VARCHAR(64) NOT NULL REFERENCES file_metadata(sha256) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    permission VARCHAR(32) NOT NULL DEFAULT 'owner',
    is_public BOOLEAN DEFAULT FALSE,
    download_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (username, file_id)
);

-- Public sharing tokens
CREATE TABLE public_shares (
    id SERIAL PRIMARY KEY,
    token VARCHAR(128) UNIQUE NOT NULL,
    file_id VARCHAR(64) NOT NULL REFERENCES file_metadata(sha256) ON DELETE CASCADE,
    username VARCHAR(255) NOT NULL REFERENCES users(username) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_file_metadata_filename ON file_metadata(filename);
CREATE INDEX idx_file_metadata_mime_type ON file_metadata(mime_type);
CREATE INDEX idx_user_files_username ON user_files(username);
CREATE INDEX idx_public_shares_token ON public_shares(token);
```

### API Design

FileVault follows RESTful API design principles with consistent patterns:

#### Response Format
```json
{
  "status": "success",
  "message": "Operation completed successfully",
  "data": {
    // Response data
  }
}
```

#### Error Format
```json
{
  "status": "error",
  "message": "Human-readable error message",
  "error": "Technical error details"
}
```

#### HTTP Status Codes

| Code | Status | Description |
|------|--------|-------------|
| 200 | ✅ Success | Request successful |
| 201 | ➕ Created | Resource created |
| 400 | ❌ Bad Request | Invalid input |
| 401 | 🚫 Unauthorized | Authentication required |
| 403 | ⛔ Forbidden | Insufficient permissions |
| 404 | 🔍 Not Found | Resource not found |
| 409 | ⚠️ Conflict | Resource conflict |
| 500 | 💥 Internal Error | Server error |

---

## 📚 API Reference

### Authentication

#### Register User
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

#### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### File Management

#### Upload File
```http
POST /api/v1/file/upload
Content-Type: multipart/form-data

file: [binary file data]
uploader: johndoe
```

#### Search Files
```http
GET /api/v1/file/search?mimeType=application/pdf&filename=document&limit=10
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "status": "success",
  "message": "Files found successfully",
  "data": [
    {
      "filename": "document.pdf",
      "mimeType": "application/pdf",
      "sha256": "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3",
      "fileSize": 1024000,
      "uploadDate": "2025-09-19T10:30:00Z",
      "uploader": "johndoe"
    }
  ]
}
```

#### Share File
```http
POST /api/v1/file/share
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "owner": "johndoe",
  "recipient": "janedoe",
  "fileId": "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3",
  "permission": "viewer"
}
```

### Admin Panel

#### List All Files
```http
GET /api/v1/admin/files
Authorization: Bearer <admin_jwt_token>
```

#### Upload File as Admin
```http
POST /api/v1/admin/upload
Authorization: Bearer <admin_jwt_token>
Content-Type: multipart/form-data

file: [binary file data]
filename: document.pdf
uploader: johndoe
```

#### Get Usage Statistics
```http
GET /api/v1/admin/stats
Authorization: Bearer <admin_jwt_token>
```

**Response:**
```json
{
  "status": "success",
  "message": "Stats fetched",
  "data": {
    "totalFiles": 150,
    "totalPhysicalFiles": 120,
    "totalUsers": 25,
    "totalDownloads": 1250,
    "totalStorageUsed": 524288000.0,
    "totalLogicalStorage": 629145600.0,
    "spaceSaved": 104857600.0
  }
}
```

### Analytics

#### Storage Analytics
```http
GET /api/v1/file/storage/analytics
```

**Response:**
```json
{
  "status": "success",
  "message": "Storage analytics",
  "data": {
    "unique_uploaders": 25,
    "logical_files": 150,
    "physical_files": 120,
    "total_storage_bytes": 524288000,
    "space_saved_bytes": 104857600,
    "space_saved_mb": 100
  }
}
```

### Public Sharing

#### Create Public Share
```http
POST /api/v1/file/public-share
Content-Type: application/json

{
  "fileId": "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3",
  "username": "johndoe"
}
```

#### Access Public File
```http
GET /api/v1/file/public/view?token=abc123def456
```

---

## 🔧 Development

### Project Structure

```
filevault-backend/
├── 📁 src/
│   ├── 📁 controllers/     # 🎛️ HTTP request handlers
│   │   ├── auth.controllers.go
│   │   ├── file.controllers.go
│   │   ├── admin.controllers.go
│   │   └── file.search.controllers.go
│   ├── 📁 dto/            # 📦 Data Transfer Objects
│   │   ├── auth.go
│   │   ├── file.meta-data.go
│   │   ├── file.search.go
│   │   └── admin.go
│   ├── 📁 repos/          # 💾 Database repositories
│   │   ├── auth.repo.go
│   │   ├── file.meta-data.repo.go
│   │   ├── file.search.repo.go
│   │   └── admin.repo.go
│   ├── 📁 routers/        # 🛣️ Route definitions
│   │   ├── auth.routes.go
│   │   ├── file.routes.go
│   │   └── admin.routes.go
│   ├── 📁 services/       # ⚙️ Service interfaces
│   │   ├── auth.go
│   │   ├── files.go
│   │   └── admin.go
│   ├── 📁 servicesImpl/   # 🔧 Service implementations
│   │   ├── auth.go
│   │   ├── file.go
│   │   ├── file.search.go
│   │   └── admin.go
│   ├── 📁 middleware/     # 🛡️ HTTP middleware
│   │   └── admin.go
│   └── 📁 utils/          # 🛠️ Utility functions
│       ├── apiResponse.go
│       ├── apiError.go
│       ├── jwt.conf.go
│       └── postgres.conf.go
├── 📁 storage/           # 📂 File storage directory
├── 📁 tmp/              # 🗂️ Temporary files
├── 📁 docs/             # 📚 Generated documentation
├── 📄 main.go           # 🚀 Application entry point
├── 📄 go.mod            # 📋 Go module file
├── 📄 docker-compose.yaml
├── 📄 Dockerfile
├── 📄 .env              # 🔧 Environment configuration
└── 📄 README.md         # 📖 This file
```

### Key Components

#### Controllers
HTTP request handlers that:
- Parse incoming requests
- Validate input data
- Call appropriate service methods
- Format and return responses

#### Services
Business logic layer that:
- Implement complex business rules
- Coordinate between multiple repositories
- Handle transactions
- Provide clean interfaces for controllers

#### Repositories
Data access layer that:
- Execute database queries
- Map database results to domain objects
- Handle database-specific optimizations
- Provide CRUD operations

#### DTOs (Data Transfer Objects)
Request/response models that:
- Define API contract
- Validate input data
- Format output data
- Isolate internal models from external API

### Testing

#### Unit Tests
```bash
# Run all tests
go test ./...

# Run tests with coverage
go test -cover ./...

# Run specific package tests
go test ./src/servicesImpl/...
```

#### Integration Tests
```bash
# Run with database
go test -tags=integration ./...
```

#### API Testing
```bash
# Using curl
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@example.com","password":"password"}'

# Using Swagger UI
open http://localhost:8080/api/docs/
```

### Deployment

#### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f backend

# Scale services
docker-compose up -d --scale backend=3
```

#### Manual Deployment
```bash
# Build for production
GOOS=linux GOARCH=amd64 go build -o filevault-backend main.go

# Run with environment variables
export PORT=8080
export DB_URL="postgres://user:pass@host:5432/db?sslmode=disable"
export JWT_SECRET="your-secret-key"
./filevault-backend
```

#### Environment Configuration
```bash
# Production environment
cp .env.prod .env
# Edit .env with production values

# Development environment
cp .env.dev .env
```

---

## 🐛 Troubleshooting

### Common Issues

#### 1. Database Connection Failed
**Error:** `pq: password authentication failed for user`
**Solution:**
```bash
# Check PostgreSQL service
sudo systemctl status postgresql

# Reset password
sudo -u postgres psql
ALTER USER filevault PASSWORD 'newpassword';
```

#### 2. File Upload Fails
**Error:** `no such file or directory`
**Solution:**
```bash
# Create storage directory
mkdir -p storage
chmod 755 storage

# Check disk space
df -h
```

#### 3. JWT Token Invalid
**Error:** `invalid token`
**Solution:**
```bash
# Check JWT secret consistency
echo $JWT_SECRET

# Verify token expiration
# Tokens expire in 72 hours by default
```

#### 4. Port Already in Use
**Error:** `bind: address already in use`
**Solution:**
```bash
# Find process using port
lsof -i :8080

# Kill process
kill -9 <PID>

# Or use different port
export PORT=8081
```

### Debugging

#### Enable Debug Logging
```bash
# Set log level
export LOG_LEVEL=debug

# View structured logs
go run main.go | jq .
```

#### Database Debugging
```bash
# Connect to database
docker exec -it filevault-postgres psql -U filevault -d filevaultdb

# Check tables
\d

# View recent queries
SELECT * FROM user_files ORDER BY created_at DESC LIMIT 5;
```

#### API Debugging
```bash
# Test endpoints with verbose output
curl -v http://localhost:8080/api/v1/file/search

# Check request/response headers
curl -I http://localhost:8080/api/v1/admin/files
```

### Logs

#### Application Logs
```bash
# View recent logs
tail -f logs/app.log

# Search for specific errors
grep "ERROR" logs/app.log

# Filter by request ID
grep "requestID-123" logs/app.log
```

#### Database Logs
```bash
# PostgreSQL logs
docker logs filevault-postgres

# Query execution logs
tail -f /var/log/postgresql/postgresql-15-main.log
```

---

## 🤝 Contributing

### Development Setup

1. **Fork the repository**
2. **Clone your fork**
   ```bash
   git clone https://github.com/your-username/filevault-backend.git
   cd filevault-backend
   ```

3. **Create feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

4. **Set up development environment**
   ```bash
   # Install dependencies
   go mod download

   # Copy environment file
   cp .env.example .env

   # Run database
   docker-compose up -d postgres

   # Run migrations
   go run scripts/migrate.go
   ```

5. **Run tests**
   ```bash
   go test ./...
   ```

### Code Style

#### Go Standards
- Follow [Effective Go](https://golang.org/doc/effective_go.html)
- Use `gofmt` for formatting
- Follow [Go Code Review Comments](https://github.com/golang/go/wiki/CodeReviewComments)

#### Project Conventions
```go
// Interface naming
type UserServiceInterface interface {
    GetUser(id string) (*User, error)
}

// Implementation naming
type UserService struct {
    repo UserRepository
}

// Constructor naming
func NewUserService(repo UserRepository) *UserService {
    return &UserService{repo: repo}
}

// Method naming
func (s *UserService) GetUser(id string) (*User, error) {
    return s.repo.FindByID(id)
}
```

#### Commit Messages
```
feat: add user authentication
fix: resolve file upload bug
docs: update API documentation
style: format code with gofmt
refactor: simplify service layer
test: add unit tests for repository
```

### Pull Requests

#### PR Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows project style
- [ ] Documentation updated
- [ ] Tests added/updated
- [ ] Breaking changes documented
```

#### Review Process
1. **Automated Checks**: CI/CD pipeline runs tests and linting
2. **Code Review**: At least one maintainer reviews changes
3. **Testing**: Reviewer tests functionality
4. **Approval**: PR approved and merged

---

## 📊 Monitoring & Metrics

### Health Checks
```http
GET /api/v1/health
```

**Response:**
```json
{
  "status": "success",
  "message": "Service is healthy",
  "data": {
    "database": "connected",
    "storage": "accessible",
    "uptime": "2h 30m"
  }
}
```

### Metrics Endpoints
```http
GET /api/v1/metrics
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "total_requests": 1250,
    "active_users": 25,
    "storage_used_mb": 512,
    "error_rate": 0.02
  }
}
```

---

## 🔒 Security

### Authentication & Authorization
- JWT tokens with 72-hour expiration
- Password hashing with bcrypt
- Admin role-based access control
- Request rate limiting

### Data Protection
- File deduplication prevents storage bloat
- Secure file paths (SHA256-based)
- Input validation and sanitization
- SQL injection prevention with prepared statements

### Best Practices
- Environment-based configuration
- Secret management
- Audit logging
- Regular security updates

---

## 📈 Performance

### Optimization Techniques
- Database indexing on frequently queried columns
- File deduplication reduces storage needs
- Connection pooling for database
- Caching for frequently accessed data

### Benchmarks
```bash
# Run performance tests
go test -bench=. ./...

# Profile application
go tool pprof http://localhost:8080/debug/pprof/profile
```

---

## 📞 Support

### Documentation
- **API Docs**: http://localhost:8080/api/docs/
- **Architecture Docs**: See [Architecture](#architecture--design) section
- **Deployment Guide**: See [Deployment](#deployment) section

### Community
- **Issues**: [GitHub Issues](https://github.com/your-username/filevault-backend/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/filevault-backend/discussions)
- **Wiki**: [Project Wiki](https://github.com/your-username/filevault-backend/wiki)

### Contact
- **Email**: support@filevault.com
- **Slack**: #filevault-dev
- **Twitter**: @filevault_dev

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Go](https://golang.org/) - The programming language
- [PostgreSQL](https://postgresql.org/) - Database system
- [Swagger](https://swagger.io/) - API documentation
- [Docker](https://docker.com/) - Containerization

---

*Built with ❤️ using Go and modern software architecture principles.*
