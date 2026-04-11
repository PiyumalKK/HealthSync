# HealthSync - Smart Healthcare Appointment & Prescription Platform

A cloud-native microservices healthcare platform built with Node.js, Python/FastAPI, React, MongoDB, and PostgreSQL.

## Architecture

- **API Gateway** - Express-based routing, JWT auth, rate limiting
- **Patient Service** - Registration, profiles, medical history (MongoDB)  
- **Doctor Service** - Doctor profiles, specializations, availability (PostgreSQL + Redis)
- **Appointment Service** - Booking, rescheduling, cancellation (PostgreSQL)
- **Prescription Service** - Digital prescriptions, PDF generation (MongoDB)
- **Notification Service** - Email/SMS/in-app alerts (MongoDB, Python/FastAPI)
- **Payment Service** - Stripe checkout, payment verification, refunds (PostgreSQL)
- **Frontend** - React + Vite + Tailwind CSS

## Prerequisites

- [Docker](https://www.docker.com/) & Docker Compose
- A [Google Cloud Console](https://console.cloud.google.com/) project with OAuth 2.0 credentials (for Google Sign-In)

## Local Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/PiyumalKK/HealthSync.git
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
   | `STRIPE_SECRET_KEY` | Stripe test secret key (starts with `sk_test_`) |
   | `STRIPE_PUBLISHABLE_KEY` | Stripe test publishable key (starts with `pk_test_`) |

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
| Payment Service | 3006 |
| PostgreSQL | 5930 |
| MongoDB | 27017 |
| Redis | 6379 |

## Databases

| Database | Engine | Service Owner | Data Stored |
|----------|--------|--------------|-------------|
| `healthsync_auth` | MongoDB | API Gateway | Users, credentials, tokens, OAuth profiles |
| `healthsync_doctors` | PostgreSQL | Doctor Service | Doctor profiles, specializations, availability |
| `healthsync_appointments` | PostgreSQL | Appointment Service | Bookings, schedules, status tracking |
| `healthsync_payments` | PostgreSQL | Payment Service | Stripe transactions, refunds, payment status |
| `healthsync_patients` | MongoDB | Patient Service | Patient profiles, medical history |
| `healthsync_prescriptions` | MongoDB | Prescription Service | Digital prescriptions, medications |
| `healthsync_notifications` | MongoDB | Notification Service | In-app alerts, notification preferences |
| Redis | Redis | Doctor Service | Doctor data cache (TTL-based) |

> **Pattern:** Database-per-service — each microservice owns its database exclusively. No cross-service DB access.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite + Tailwind CSS |
| Backend (Node) | Node.js + Express |
| Backend (Python) | Python + FastAPI |
| Databases | MongoDB + PostgreSQL |
| Payments | Stripe (test mode) |
| Cache | Redis |
| Container | Docker + Docker Compose |
