# 🌟 MyDrive - Complete File Vault System

<div align="center">

> **📝 Author Information**  
> **Ashrith Sai J** | **22BCB7308**  
> 📧 **ashrithsai.devison@gmail.com**  

---

![MyDrive Logo](https://via.placeholder.com/400x120/6e73fa/ffffff?text=MyDrive+File+Vault)

</div>

## 🚀 Quick Start Guide

### 📋 Prerequisites

- **Node.js** (v18 or higher)
- **Go** (v1.19 or higher)
- **PostgreSQL** (v13 or higher)
- **Docker & Docker Compose** (optional, for containerized setup)

### ⚡ Quick Setup (Docker - Recommended)

```bash
# 1. Clone the repository
git clone <repository-url>
cd vit-2026-c- SSR-compatible authentication

### v1.0.0 - Initial Release
- Basic file management
- User authentication
- File upload/download
- Admin dashboard

---

## 🧪 Testing & Development

### API Testing with Swagger

1. **Start the backend server**
2. **Open Swagger UI**: http://localhost:8080/swagger/index.html
3. **Test endpoints interactively**

### Key API Endpoints

#### 🔐 Authentication
```bash
# Register a new user
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123","name":"John Doe"}'

# Login
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

#### 📁 File Operations
```bash
# Get user files
curl -X GET "http://localhost:8080/api/v1/file/owned?username=johndoe" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Upload file metadata
curl -X POST http://localhost:8080/api/v1/file/upload-meta \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"filename":"document.pdf","size":1024,"mimetype":"application/pdf"}'
```

#### 👥 Admin Operations
```bash
# Get all users (admin only)
curl -X GET http://localhost:8080/api/v1/admin/users \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"

# Generate token for user impersonation
curl -X POST http://localhost:8080/api/v1/admin/generate-token \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"username":"targetuser"}'

# Get system statistics
curl -X GET http://localhost:8080/api/v1/admin/stats \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

### 🚨 Troubleshooting

#### Common Issues

1. **Port already in use**
   ```bash
   # Kill processes on ports 4000 and 8080
   sudo lsof -ti:4000,8080 | xargs kill -9
   ```

2. **Database connection issues**
   ```bash
   # Check PostgreSQL status
   sudo systemctl status postgresql
   
   # Restart PostgreSQL
   sudo systemctl restart postgresql
   ```

3. **Docker issues**
   ```bash
   # Clean Docker cache
   docker-compose down --volumes
   docker system prune -a
   
   # Rebuild containers
   docker-compose up --build --force-recreate
   ```

4. **CORS issues**
   - Ensure frontend runs on port 4000
   - Backend automatically allows localhost:4000 origins

### 🔍 Monitoring & Logs

#### View Application Logs
```bash
# Backend logs
docker-compose logs backend

# Frontend logs
docker-compose logs frontend

# Database logs
docker-compose logs postgres

# Follow live logs
docker-compose logs -f
```

#### Health Checks
```bash
# Backend health
curl http://localhost:8080/health

# Frontend health
curl http://localhost:4000/api/health
```

---

## 🎯 Default User Accounts

After running the system, you can use these test accounts:

### Admin Account
- **Email**: `admin@example.com`
- **Password**: `admin123`
- **Features**: User management, system stats, user impersonation

### Regular User Account
- **Email**: `user@example.com`
- **Password**: `user123`
- **Features**: File management, sharing, personal storage

---

## 🏗️ Development Workflow

### Making Changes

1. **Frontend changes**:
   ```bash
   cd client
   npm run dev  # Hot reload enabled
   ```

2. **Backend changes**:
   ```bash
   cd server
   go run main.go  # Restart required for changes
   ```

3. **Database changes**:
   ```bash
   # Update migrations.sql and restart backend
   psql -d filevault -f data/migrations.sql
   ```

### Code Quality

```bash
# Frontend linting
cd client && npm run lint

# Frontend formatting
cd client && npm run format

# Backend formatting
cd server && go fmt ./...

# Backend testing
cd server && go test ./...
```

---

## 📜 Licenseernship-hiring-task-ashrith-devison

# 2. Start all services with Docker Compose
docker-compose up --build

# 3. Access the application
# Frontend: http://localhost:4000
# Backend API: http://localhost:8080
# API Documentation: http://localhost:8080/swagger/index.html
```

### 🛠️ Manual Setup

#### Backend Setup (Go + PostgreSQL)

```bash
# 1. Navigate to server directory
cd server

# 2. Install Go dependencies
go mod download

# 3. Set up PostgreSQL database
createdb filevault

# 4. Set environment variables
export DB_HOST=localhost
export DB_PORT=5432
export DB_USER=your_username
export DB_PASSWORD=your_password
export DB_NAME=filevault
export JWT_SECRET=your-super-secret-key

# 5. Run database migrations
psql -d filevault -f data/migrations.sql

# 6. Start the backend server
go run main.go

# Backend will be available at http://localhost:8080
```

#### Frontend Setup (Next.js 15)

```bash
# 1. Navigate to client directory
cd client

# 2. Install dependencies
npm install

# 3. Set up environment variables
echo "NEXT_PUBLIC_API_URL=http://localhost:8080" > .env.local

# 4. Start the development server
npm run dev

# Frontend will be available at http://localhost:4000
```

## 🔧 Configuration

### Backend Environment Variables

Create a `.env` file in the `server` directory:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=filevault

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key

# Server Configuration
PORT=8080

# Storage Configuration
UPLOAD_PATH=./storage
MAX_FILE_SIZE=10485760  # 10MB in bytes
```

### Frontend Environment Variables

Create a `.env.local` file in the `client` directory:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8080

# Optional: For production
NEXT_PUBLIC_APP_URL=http://localhost:4000
```

## 📊 System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (Next.js 15)  │◄──►│   (Go + Gin)    │◄──►│   (PostgreSQL)  │
│   Port: 4000    │    │   Port: 8080    │    │   Port: 5432    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🎯 Feature Showcase

### 📁 ** Drive-Like Interface**
```
📂 My Drive
├── 📁 Documents/
│   ├── 📄 report.pdf
│   └── 📄 presentation.pptx
├── 📁 Images/
│   ├── 🖼️ photo1.jpg
│   └── 🖼️ photo2.png
└── 📄 readme.txt
```

**Features:**
- 🔍 **Breadcrumb Navigation** - Visual path indication (`Home > Documents > Reports`)
- 📁 **Nested Folders** - Unlimited folder depth with real-time backend sync
- 🎯 **Smart Upload** - Upload directly to specific folders or create new ones
- 👁️ **File Preview** - In-browser preview for images, PDFs, videos, and audio files
- ⚡ **Quick Actions** - View, Download, Rename, Share, Star, Delete

### 🔄 **File Operations Workflow**

1. **📤 Upload Files**
   ```
   Drag & Drop → Choose Target Folder → Upload Progress → Success ✅
   ```

2. **👁️ Preview Files**
   ```
   ```

3. **✏️ Rename Files**
   ```
   Right Click → Rename → Type New Name → Enter → API Sync ✅
   ```

   ```
   Select File → Delete → Confirm → Backend Removal ✅
   ```

### 🎨 **UI/UX Highlights**
- **Dark Theme** - Professional appearance with gradient accents
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- **Grid/List Toggle** - Switch between different file view modes
- **Real-time Updates** - Instant UI feedback with backend synchronization
- **Error Handling** - User-friendly error messages with recovery options

---

## 🚀 Quick Startia.placeholder.com/400x120/1e293b/ffffff?text=MyDrive+File+Vault)

[![Next.js](https://img.shields.io/badge/Frontend-Next.js_15-000000?style=for-the-badge&logo=next.js&logoColor=white)](./client/)
[![Go](https://img.shields.io/badge/Backend-Go_1.21+-00ADD8?style=for-the-badge&logo=go&logoColor=white)](./server/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](./client/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-316192?style=for-the-badge&logo=postgresql&logoColor=white)](./server/)

*A modern, secure, and scalable cloud storage solution with advanced file management capabilities*

[🚀 Quick Start](#-quick-start) • [📖 Documentation](#-project-components) • [🏗️ Architecture](#%EF%B8%8F-system-architecture) • [🤝 Contributing](#-contributing)

## 📊 System Overview

MyDrive is a full-stack file management system that combines a modern **React/Next.js frontend** with a high-performance **Go backend** to deliver enterprise-grade cloud storage functionality.

<div align="center">

| Component | Technology | Status | Documentation |
|-----------|------------|---------|---------------|
| 🎨 **Frontend** | Next.js 15 + TypeScript | ✅ Production Ready | [📖 Client Docs](./client/) |
| ⚡ **Backend** | Go 1.21 + PostgreSQL | ✅ Production Ready | [📖 Server Docs](./server/) |
| 🐳 **Infrastructure** | Docker Compose | ✅ Ready to Deploy | [🚀 Deployment Guide](#-deployment) |

</div>

## ✨ Key Features

### 🔐 **Security & Authentication**
- JWT-based authentication with bcrypt password hashing
- Role-based access control (User/Admin)
- Secure file sharing with token-based permissions
- Server-side middleware + client-side route protection

### 📁 **Advanced File Management**
- Intelligent file deduplication using SHA-256 hashing
- Real-time file search and filtering capabilities
- File organization with starring, tagging, and trash system
- Multiple file format support with MIME type detection
- **🆕 Google Drive-like Interface** - Nested folder structure with breadcrumb navigation
- **🆕 File Operations Suite**:
  - 📁 Folder creation with backend synchronization
  - 📤 Drag-and-drop uploads with folder targeting
  - 👁️ File preview with multi-format support (images, PDFs, videos, audio)
  - ✏️ Real-time file renaming with API integration
  - 💾 Secure file downloads with authentication
  - 🗑️ File deletion with backend API integration
- **🆕 Smart Upload System** - Custom folder creation during upload process

### 🎨 **Modern User Experience**
- Dark-first responsive design with glassmorphism effects
- Real-time state management with Zustand
- SSR-compatible authentication flow
- Intuitive drag-and-drop file uploads
- **🆕 Google Drive-inspired UI** - Familiar file management interface
- **🆕 Advanced File Preview** - In-browser preview for multiple file types
- **🆕 Context Menus** - Right-click and dropdown actions for all file operations
- **🆕 Grid & List Views** - Toggle between different file display modes

### 📊 **Analytics & Monitoring**
- Comprehensive storage analytics and usage statistics
- Admin dashboard with user management
- File deduplication savings tracking
- Real-time performance metrics

---

## 🏗️ System Architecture

```mermaid
graph TB
    subgraph "Client Tier (Port 3000)"
        A[Next.js Frontend]
        B[React Components]
        C[Zustand State Management]
        D[Authentication Middleware]
        
        A --> B
        A --> C
        A --> D
    end
    
        E[Go HTTP Server]
        F[JWT Authentication]
        
        E --> G
        E --> H
    subgraph "Data Tier (Port 5432)"
        K[File Storage System]
        L[User Data]
        J --> L
        K --> M
    end
    
    A -->|HTTP/REST API| E
    E -->|SQL Queries| J
    G -->|File Operations| K
    
    subgraph "Deployment"
        N[Docker Compose]
        O[Frontend Container]
        P[Backend Container]
        Q[PostgreSQL Container]
        
        N --> O
        N --> P
        N --> Q
    end
```

---

## 📖 Project Components

### 🎨 Frontend Application
**Location:** [`./client/`](./client/)  
**Technology:** Next.js 15 + TypeScript + Tailwind CSS

The modern React-based frontend provides an intuitive user interface for file management with advanced features:

#### Key Features:
- 🔐 **Advanced Authentication** - Dual-layer security with SSR compatibility
- 💾 **State Management** - Zustand stores with persistent sessions  
- 🎨 **Modern UI/UX** - Dark theme with gradient accents and glassmorphism
- 📱 **Responsive Design** - Mobile-first approach with accessibility compliance
- ⚡ **Performance** - Server-side rendering with optimized bundle sizes

#### 📚 [**→ Read Complete Frontend Documentation**](./client/)

---

### ⚡ Backend API
**Location:** [`./server/`](./server/)  
**Technology:** Go 1.21 + PostgreSQL + Docker

High-performance REST API server built with Go, featuring comprehensive file management capabilities:

#### Key Features:
- 🔐 **Secure Authentication** - JWT tokens with bcrypt password hashing
- 📁 **File Deduplication** - SHA-256 based storage optimization
- 🔍 **Advanced Search** - Multi-parameter file search and filtering
- 👥 **User Management** - Role-based permissions and admin controls
- 📊 **Analytics Dashboard** - Storage metrics and usage statistics
- 🌐 **Public Sharing** - Token-based secure file sharing
- 📚 **API Documentation** - Auto-generated Swagger documentation

#### 📚 [**→ Read Complete Backend Documentation**](./server/)

---

## � API Endpoints

### 🔐 Authentication Endpoints
- `POST /api/auth/login` - User login with JWT token generation
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout

### 📁 File Management Endpoints
- `GET /api/v1/file/owned?username={username}` - Get user's files with nested folder structure
- `POST /api/v1/file/upload-meta` - Upload file with metadata
- `POST /api/v1/file/rename` - Rename files and folders
- `GET /api/v1/file/path/download?path={filename}` - Download files with authentication
- `GET /api/v1/file/path/view?path={filename}` - Preview files in browser
- `POST /api/v1/file/delete-filename` - Delete files and folders

### 👥 User & Admin Endpoints
- `GET /api/v1/admin/users` - Admin user management
- `GET /api/v1/admin/stats` - System analytics and statistics
- `POST /api/v1/user/profile` - Update user profile

### 🔗 File Sharing
- `POST /api/v1/file/share` - Generate shareable links
- `GET /api/v1/file/shared/{token}` - Access shared files

---

## �🚀 Quick Start

### Prerequisites
- 🐳 **Docker & Docker Compose** (recommended)
- 🟢 **Node.js 18+** (for local development)
- 🐹 **Go 1.21+** (for local development)
- 🐘 **PostgreSQL 15+** (for local development)

### 🐳 Docker Deployment (Recommended)

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd mydrive-filevault
   ```

2. **Start the complete system:**
   ```bash
   docker-compose up -d
   ```

3. **Access the applications:**
   - 🎨 **Frontend:** http://localhost:3000
   - ⚡ **Backend API:** http://localhost:8080
   - 📚 **API Documentation:** http://localhost:8080/swagger/index.html

### 🛠️ Local Development

#### Backend Setup
```bash
cd server/
go mod download
go run main.go
```

#### Frontend Setup  
```bash
cd client/
npm install
npm run dev
```

#### Database Setup
```bash
# Using Docker for PostgreSQL
docker run -d \
  --name mydrive-postgres \
  -e POSTGRES_USER=filevault \
  -e POSTGRES_PASSWORD=securepassword \
  -e POSTGRES_DB=filevaultdb \
  -p 5432:5432 \
  postgres:15
```

---

## 🔧 Configuration

### Environment Variables

#### Frontend (`.env.local`)
```bash
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_APP_NAME=MyDrive
NEXT_PUBLIC_APP_VERSION=1.0.0
```

#### Backend (`.env`)
```bash
DATABASE_URL=postgres://filevault:securepassword@localhost:5432/filevaultdb
JWT_SECRET=your-secret-key
PORT=8080
STORAGE_PATH=./storage
```

---

## 📊 Development Statistics

<div align="center">

| Metric | Frontend | Backend | Total |
|---------|----------|---------|-------|
| **Lines of Code** | ~8,500 | ~4,500 | ~13,000 |
| **React Components** | 35+ | - | 35+ |
| **API Integrations** | 15+ | 25+ | 40+ |
| **File Operations** | 8 | 12+ | 20+ |
| **Authentication Features** | 5 | 8 | 13 |

**🆕 Recent Additions:**
- ✅ **File Preview System** - Multi-format preview with 6+ file type handlers
- ✅ **Google Drive UI** - Complete interface redesign with breadcrumb navigation
- ✅ **CRUD Operations** - Full file lifecycle management (Create, Read, Update, Delete)
- ✅ **Real-time Sync** - Backend integration for all file operations
- ✅ **Advanced Upload** - Folder targeting and custom folder creation

</div>

---

## 🏃‍♂️ Available Scripts

### Root Directory
```bash
# Start complete system with Docker
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f
```

### Frontend Commands
```bash
cd client/
npm run dev      # Development server
npm run build    # Production build
npm run start    # Production server
npm run lint     # ESLint check
npm run type-check # TypeScript check
```

### Backend Commands
```bash
cd server/
go run main.go          # Development server
go build -o server      # Build binary
go test ./...           # Run tests
go mod tidy            # Clean dependencies
```

---

## 🤝 Contributing

We welcome contributions to both frontend and backend components!

### Development Workflow
1. 🍴 Fork the repository
2. 🌿 Create a feature branch (`git checkout -b feature/amazing-feature`)
3. 💻 Make your changes in the appropriate component:
   - Frontend changes: [`./client/`](./client/)
   - Backend changes: [`./server/`](./server/)
4. ✅ Test your changes locally
5. 📤 Push to your branch and create a Pull Request

### Code Style Guidelines
- **Frontend:** Follow the ESLint and Prettier configurations
- **Backend:** Use Go fmt and follow Go best practices
- **Commits:** Use conventional commit messages
- **Documentation:** Update relevant README files

---

## 📁 Project Structure

```
mydrive-filevault/
├── 📁 client/              # Next.js frontend application
│   ├── src/
│   │   ├── app/            # App router pages
│   │   ├── components/     # React components
│   │   ├── stores/         # Zustand state management
│   │   └── lib/            # Utility functions
│   ├── public/             # Static assets
│   └── README.md           # Frontend documentation
├── 📁 server/              # Go backend application
│   ├── src/
│   │   ├── controllers/    # HTTP handlers
│   │   ├── services/       # Business logic
│   │   ├── repos/          # Database layer
│   │   └── middleware/     # HTTP middleware
│   ├── storage/            # File storage
│   └── README.md           # Backend documentation
├── docker-compose.yaml     # Docker orchestration
└── README.md              # This file
```

---

## � Changelog

### v3.0.0 - Complete File Management Suite (Latest)
**🚀 Major Feature Release - Google Drive-Like Interface**

#### ✨ New Features
- **📁 Google Drive Interface** - Complete UI redesign with nested folder structure
- **👁️ File Preview System** - In-browser preview for multiple file formats
- **✏️ Real-time Operations** - Rename, delete, download with instant API sync
- **📤 Smart Upload** - Folder targeting and custom folder creation
- **🔍 Breadcrumb Navigation** - Visual path indication for deep folders
- **🎯 Context Menus** - Right-click and dropdown actions
- **🔲 Grid/List Views** - Toggle between different display modes

#### 🔧 Technical Improvements
- Enhanced API integration with 15+ new endpoints
- Improved error handling with user-friendly messages
- Optimized state management with real-time sync
- Added comprehensive file type detection
- Implemented secure blob URL handling for previews

#### 📊 Statistics
- **8+ File Operations** - Complete CRUD functionality
- **6+ Preview Types** - Support for images, PDFs, videos, audio, text
- **15+ API Integrations** - Full backend synchronization
- **35+ React Components** - Modular, reusable architecture

### v2.1.0 - Enhanced Upload System
- Custom folder creation during upload
- Real-time progress tracking
- Advanced error handling and validation
- SHA-256 integrity verification

### v2.0.0 - Authentication Foundation
- Dual-layer security system
- JWT token management
- Role-based access control
- SSR-compatible authentication

### v1.0.0 - Initial Release
- Basic file management
- User authentication
- File upload/download
- Admin dashboard

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## � Documentation

- **[Frontend Documentation](./client/README.md)** - Next.js client setup and development
- **[Backend Documentation](./server/README.md)** - Go server API and architecture  
- **[Contributing Guide](./CONTRIBUTING.md)** - How to contribute to the project
- **[Deployment Guide](./DEPLOYMENT.md)** - Production deployment instructions

## �🙏 Acknowledgments

- **Frontend:** Next.js, React, Tailwind CSS, Zustand, Shadcn/ui
- **Backend:** Go, PostgreSQL, JWT, Swagger
- **Infrastructure:** Docker, Docker Compose

---

<div align="center">

**Built with ❤️ for the future of cloud storage**

[![Frontend Docs](https://img.shields.io/badge/📖_Frontend-Documentation-blue?style=for-the-badge)](./client/)
[![Backend Docs](https://img.shields.io/badge/📖_Backend-Documentation-green?style=for-the-badge)](./server/)
[![Contributing](https://img.shields.io/badge/🤝_Contributing-Guide-purple?style=for-the-badge)](./CONTRIBUTING.md)
[![Deploy](https://img.shields.io/badge/🚀_Deploy-Guide-red?style=for-the-badge)](./DEPLOYMENT.md)

*MyDrive - Where your files find their perfect home* 🏠

</div>
