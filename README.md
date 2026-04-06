# HealthSync - Smart Healthcare Appointment & Prescription Platform

A cloud-native microservices healthcare platform built with Node.js, Python/FastAPI, React, MongoDB, and PostgreSQL.

## Architecture

- **API Gateway** - Express-based routing, JWT auth, rate limiting
- **Patient Service** - Registration, profiles, medical history (MongoDB)  
- **Doctor Service** - Doctor profiles, specializations, availability (PostgreSQL + Redis)
- **Appointment Service** - Booking, rescheduling, cancellation (PostgreSQL)
- **Prescription Service** - Digital prescriptions, PDF generation (MongoDB)
- **Notification Service** - Email/SMS/in-app alerts (MongoDB, Python/FastAPI)
- **Frontend** - React + Vite + Tailwind CSS

## Prerequisites

- [Docker](https://www.docker.com/) & Docker Compose
- A [Google Cloud Console](https://console.cloud.google.com/) project with OAuth 2.0 credentials (for Google Sign-In)

## Local Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/<your-username>/healthsync.git
   cd healthsync
   ```

2. **Create your `.env` file**

   ```bash
   cp .env.example .env
   ```

   Open `.env` and fill in the required values:

   | Variable | Description |
   |----------|-------------|
   | `JWT_SECRET` | Random secret string for signing access tokens |
   | `JWT_REFRESH_SECRET` | Random secret string for signing refresh tokens |
   | `GOOGLE_CLIENT_ID` | OAuth 2.0 Client ID from Google Cloud Console |
   | `POSTGRES_PASSWORD` | Password for the PostgreSQL database |

3. **Start all services**

   ```bash
   docker compose up --build
   ```

4. **Access the application**

   | Service | URL |
   |---------|-----|
   | Frontend | http://localhost:3000 |
   | API Gateway | http://localhost:8090 |

5. **Stop all services**

   ```bash
   docker compose down
   ```

## Services & Ports

| Service | Port |
|---------|------|
| Frontend | 3000 |
| API Gateway | 8090 |
| Patient Service | 3001 |
| Doctor Service | 3002 |
| Appointment Service | 3003 |
| Prescription Service | 3004 |
| Notification Service | 3005 |
| PostgreSQL | 5930 |
| MongoDB | 27017 |
| Redis | 6379 |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite + Tailwind CSS |
| Backend (Node) | Node.js + Express |
| Backend (Python) | Python + FastAPI |
| Databases | MongoDB + PostgreSQL |
| Cache | Redis |
| Container | Docker + Docker Compose |
