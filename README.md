

# 🚀 MyDrive File Vault System


**Access the deployed application here:**

- **Frontend (Vercel):** [https://filevault-cap.vercel.app/](https://filevault-cap.vercel.app/)
- **Backend (Render):** [https://vit-2026-capstone-internship-hiring-task-jkaj.onrender.com/](https://vit-2026-capstone-internship-hiring-task-jkaj.onrender.com/)
- **API Docs:** [https://vit-2026-capstone-internship-hiring-task-jkaj.onrender.com/api/docs/](https://vit-2026-capstone-internship-hiring-task-jkaj.onrender.com/api/docs/)

## 🚀 Live Demo

```mermaid
%% Mermaid flowchart to highlight Live Demo URLs
flowchart TD
  A[Frontend\nVercel]:::frontend -->|"https://filevault-cap.vercel.app/"| B[Live App]
  C[Backend\nRender]:::backend -->|"https://vit-2026-capstone-internship-hiring-task-jkaj.onrender.com/"| B
  D[API Docs]:::docs -->|"/api/docs/"| B
  classDef frontend fill:#6e73fa,stroke:#fff,stroke-width:2px,color:#fff;
  classDef backend fill:#00bfae,stroke:#fff,stroke-width:2px,color:#fff;
  classDef docs fill:#ffb347,stroke:#fff,stroke-width:2px,color:#fff;
```

<div align="center">
  <img src="https://undraw.co/api/illustrations/svg?search=cloud&color=6e73fa" alt="Cloud Storage Illustration" height="120" />
  <br>
  <b>Modern, secure, and scalable cloud storage with advanced file management</b>
  <br>
  <br>
  <b>📝 Author: Ashrith Sai J (22BCB7308)</b><br>
  <b>📧 Email: ashrithsai.devison@gmail.com</b>
  <br>
  <a href="./client/">Frontend Docs</a> • <a href="./server/">Backend Docs</a> • <a href="#-quick-start">Quick Start</a> • <a href="#-contributing">Contributing</a>
</div>

---

## 🌟 Features

| Icon | Feature | Description |
|------|---------|-------------|
| 🔐 | Secure Authentication | JWT, bcrypt, role-based access |
| 📁 | File Deduplication | SHA-256, space savings |
| 🔍 | Advanced Search | Name, MIME type, metadata |
| 👥 | User Management | Admin/user roles, permissions |
| 📊 | Analytics Dashboard | Usage stats, deduplication ratio |
| 🌐 | Public Sharing | Token-based sharing |
| 🐳 | Docker Ready | Containerized deployment |
| 📚 | API Docs | Auto-generated Swagger |
| 🎨 | Modern UI/UX | Responsive, dark theme |

---


## ⚡ Setup & Getting Started

### Prerequisites
- 🐳 Docker & Docker Compose (recommended)
- 🟢 Node.js 18+
- 🐹 Go 1.21+
- 🐘 PostgreSQL 15+

### 🚀 Docker Setup (Recommended)
```bash
# 1. Clone the repository
git clone <repository-url>
cd vit-2026-capstone-internship-hiring-task-ashrith-devison

# 2. Build and start Docker containers
docker compose build
docker compose up -d

# 3. Set up the database
cd server/data
cat migrations.sql  # Copy the content of this file

# 4. Connect to PostgreSQL and run migrations
docker exec -it filevault-postgres psql -U filevault -d filevaultdb
# Paste the copied SQL content from migrations.sql and press Enter

# 5. Access the application
# Frontend: http://localhost:3000
# Backend: http://localhost:8080
# Swagger Docs: http://localhost:8080/api/docs/
```

### 🛠️ Manual Setup
#### Backend
```bash
cd server
go mod download
cp .env.example .env # Edit with your DB/JWT config
psql -U postgres -d filevaultdb -f data/migrations.sql
go run main.go
# Backend: http://localhost:8080
# Swagger Docs: http://localhost:8080/api/docs/
```
#### Frontend
```bash
cd client
npm install
npm run dev
# Frontend: http://localhost:3000
```

#### Database (Docker)
```bash
docker run -d \
  --name filevault-postgres \
  -e POSTGRES_USER=filevault \
  -e POSTGRES_PASSWORD=securepassword \
  -e POSTGRES_DB=filevaultdb \
  -p 5432:5432 \
  postgres:15
```

---

## 📖 Swagger API Documentation

Easily explore and test all backend endpoints using the built-in Swagger UI:

- **URL:** [http://localhost:8080/api/docs/](http://localhost:8080/api/docs/)
- **Features:**
  - Interactive API explorer
  - Try out requests directly in the browser
  - View request/response models and error codes

Swagger is automatically generated and always up-to-date with the backend code. Perfect for development, testing, and integration!

---

## 🗂️ Project Structure
```
filevault-backend/
├── client/   # Next.js frontend
├── server/   # Go backend
├── docker-compose.yaml
└── README.md
```

---

## 🛠️ Configuration

### Backend (`server/.env`)
```env
DATABASE_URL=postgres://filevault:securepassword@localhost:5432/filevaultdb
JWT_SECRET=your-secret-key
PORT=8080
STORAGE_PATH=./storage
```

### Frontend (`client/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_APP_NAME=MyDrive
NEXT_PUBLIC_APP_VERSION=1.0.0
```

---

## 📚 Documentation

- [Frontend Docs](./client/README.md)
- [Backend Docs](./server/README.md)
- [API Docs (Local)](http://localhost:8080/api/docs/) | [API Docs (Production)](https://vit-2026-capstone-internship-hiring-task-jkaj.onrender.com/api/docs/)
- [Contributing Guide](./CONTRIBUTING.md)
- [Deployment Guide](./DEPLOYMENT.md)

---

## 🔗 Key API Endpoints

| Category | Endpoint | Description |
|----------|----------|-------------|
| Auth     | POST /api/v1/auth/login | User login |
| Auth     | POST /api/v1/auth/register | User registration |
| File     | GET /api/v1/file/owned?username= | Get user files |
| File     | POST /api/v1/file/upload-meta | Upload file metadata |
| File     | POST /api/v1/file/rename | Rename files/folders |
| File     | GET /api/v1/file/path/download?path= | Download file |
| File     | GET /api/v1/file/path/view?path= | Preview file |
| File     | POST /api/v1/file/delete-filename | Delete file/folder |
| Admin    | GET /api/v1/admin/users | List users (admin) |
| Admin    | GET /api/v1/admin/stats | System stats (admin) |
| Admin    | POST /api/v1/admin/generate-token | Impersonate user (admin) |
| Share    | POST /api/v1/file/share | Generate share link |
| Share    | GET /api/v1/file/shared/{token} | Access shared file |

---

## 🧪 Testing & Development

### Scripts
```bash
# Start all services
docker compose up -d
# Stop all services
docker compose down
# View logs
docker compose logs -f
# Frontend
cd client && npm run dev
# Backend
cd server && go run main.go
# Backend tests
cd server && go test ./...
```

---

## 🚨 Troubleshooting

- Ensure Docker/PostgreSQL are running
- Check `.env` files for DB/JWT config
- For migration issues, verify `server/data/migrations.sql` is applied
- Kill processes on ports 3000/8080 if needed

---

## 🤝 Contributing

1. 🍴 Fork the repository
2. 🌿 Create a feature branch (`git checkout -b feature/amazing-feature`)
3. 💻 Make changes in `client/` or `server/`
4. ✅ Test locally
5. 📤 Push and create a Pull Request

**Code Style:**
- Frontend: ESLint, Prettier
- Backend: Go fmt, best practices
- Conventional commits

---

## 📜 License

MIT License - see [LICENSE](LICENSE)

---

<div align="center">
  <br>
  <b>Built with ❤️ for the future of cloud storage</b>
  <br>
  <br>
  <a href="./client/">Frontend Docs</a> • <a href="./server/">Backend Docs</a> • <a href="#-quick-start">Quick Start</a> • <a href="#-contributing">Contributing</a>
  <br>
  <br>
  <i>MyDrive - Where your files find their perfect home 🏠</i>
</div>
