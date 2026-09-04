
# Multi-Service Optimized Docker Application

A production-grade multi-container application demonstration featuring a React frontend, Node.js Express API, MongoDB database, Redis cache, and an Nginx reverse proxy. Built using Docker Compose with security, performance, and reliability best practices.

---

## 🏗️ System Architecture

```text
                        +-------------------+
                        |   Nginx Proxy     |  (Port 80)
                        +---------+---------+
                                  |
                +-----------------+-----------------+
                |                                   |
                v                                   v
      +-------------------+               +-------------------+
      |   React Frontend  |               |    Node.js API    |
      |   (Static Nginx)  |               |     (Express)     |
      +-------------------+               +---------+---------+
                                                    |
                                          +---------+---------+
                                          |                   |
                                          v                   v
                                +------------------+ +-----------------+
                                |  MongoDB (Data)  | |  Redis (Cache)  |
                                +------------------+ +-----------------+
Key Technical Features
Network Isolation: Dual-bridge architecture (frontend-network and backend-network) prevents external traffic from reaching internal databases.

Multi-Stage Builds: Lightens container footprints by building static frontend assets and discarding node/npm build dependencies in production.

Docker Secrets: Securely injects database credentials into MongoDB without hardcoding passwords in Compose files.

Persistence: Named volumes (multi-service-mongodb-data, multi-service-redis-data) ensure zero data loss across container restarts.

Resilience & Monitoring: Docker health checks for all services with automatic container restarts (restart: unless-stopped).

Log Management: json-file log driver with file rotation capped at 10MB per file (max 3 files per container).

📁 Repository Structure
Plaintext
multi-service-app/
│
├── api/                   # Node.js Express API service
│   ├── Dockerfile         # Multi-stage optimized API image
│   ├── .dockerignore      # Excludes node_modules and logs
│   ├── package.json
│   └── server.js          # REST endpoints & Redis caching logic
│
├── frontend/              # React frontend application
│   ├── Dockerfile         # Multi-stage React + Nginx static server image
│   ├── .dockerignore
│   ├── package.json
│   ├── index.html
│   └── src/
│
├── nginx/                 # Reverse proxy configuration
│   ├── Dockerfile
│   └── nginx.conf         # Traffic routing rules for frontend & API
│
├── docker/
│   └── Dockerfile.node-base # Custom minimal Alpine Node base image
│
├── secrets/
│   ├── .gitkeep
│   └── mongo_root_password.txt  # Local secret store (ignored by Git)
│
├── compose.yaml           # Core Docker Compose orchestration file
├── .gitignore
└── README.md
🚀 Getting Started
Prerequisites
Docker Engine (v20.10+)

Docker Compose (v2.0+)

1. Setup Secrets
Create the secrets directory and define a MongoDB root password:

Bash
mkdir -p secrets
echo "SuperSecretPass123!" > secrets/mongo_root_password.txt
chmod 600 secrets/mongo_root_password.txt
2. Build Base Image
Build the custom base image used by the Node service:

Bash
docker build -t node-base:latest -f docker/Dockerfile.node-base .
3. Launch the Stack
Start all services in detached mode:

Bash
docker compose up -d --build
4. Verify Stack Health
Check container status and health checks:

Bash
docker compose ps
🧪 Testing Endpoints
Service	Endpoint	Description
Frontend	http://localhost/	React Web Application
Health Check	http://localhost/health	Status of API, MongoDB, and Redis
Fetch Users	http://localhost/api/users	Returns users from Redis (cached) or MongoDB
Create User	http://localhost/api/users	POST request to insert user into MongoDB
Testing Caching Logic
Create a User:

Bash
curl -X POST http://localhost/api/users \
  -H "Content-Type: application/json" \
  -d '{"name": "Alice", "email": "alice@example.com"}'
Fetch Users (Initial query hits MongoDB):

Bash
curl http://localhost/api/users
# Returns: {"source": "mongodb", "users": [...]}
Fetch Users Again (Subsequent query hits Redis cache):

Bash
curl http://localhost/api/users
# Returns: {"source": "redis", "users": [...]}
🛠️ Management Commands
Stream Logs:

Bash
docker compose logs -f --tail=50
Restart Service:

Bash
docker compose restart api
Stop Stack (Preserve Data):

Bash
docker compose down
Destroy Stack (Purge Data Volumes):

Bash
docker compose down -v
🔒 Security & Best Practices
Never commit secrets/mongo_root_password.txt or .env files to source control.

In AWS/Production environments, replace Docker file secrets with AWS Secrets Manager or HashiCorp Vault.
