# Support Operations Dashboard

A lightweight **Application Support / DevOps-style dashboard** built with **FastAPI, SQLite, and JavaScript**.

The application simulates real-world support operations such as:

- incident management
- service monitoring
- log analysis
- system health checks
- role-based access control (RBAC)

The goal of the project is to demonstrate how an **Application Support Engineer** can interact with APIs, monitor services, analyze logs, and manage incidents.

---

# Architecture

Backend:
- FastAPI
- SQLAlchemy
- SQLite

Frontend:
- HTML
- CSS
- Vanilla JavaScript

Authentication:
- simple role-based authentication (admin / standard)

---

# Features

## Incident Management

Users can create, view, resolve and delete incidents.

Incident fields:

- title
- service name
- priority (low / medium / high)
- status (open / resolved)
- created_at timestamp
- resolved_at timestamp

Example incidents:

- Document processing timeout
- Authentication service login failures
- API gateway timeout

---

## Service Monitoring

The dashboard can perform simple health checks on external services.

It sends an HTTP request to a URL and returns:

- service name
- HTTP status code
- latency
- status (healthy / degraded / down)

Example use case:

Monitor if a public API or service endpoint is responding.

---

## System Health Check

The system provides a basic health endpoint that returns:

- application status
- database status
- timestamp

This simulates how support engineers verify system health.

---

## Log Analyzer

The log analyzer allows users to paste raw logs and detect common problems.

The analyzer counts:

- errors
- warnings
- timeouts
- authentication failures

This simulates the type of log analysis done during incident investigation.

---

## Role Based Access Control (RBAC)

Two user roles exist:

### Admin

Can:

- create incidents
- resolve incidents
- delete incidents
- run service monitoring
- analyze logs
- view incidents

### Standard User

Can only:

- view incidents
- view system health

---

# Project Structure

app/
routes/
auth.py
health.py
incidents.py
logs.py
monitoring.py

database.py
logger.py
models.py

static/
index.html
login.html
app.js
login.js
style.css

requirements.txt
.gitignore
README.md


---

# Installation

Clone the repository:
git clone https://github.com/yourusername/support-operations-dashboard.git

Navigate to the project:
cd support-operations-dashboard


Create virtual environment:


python -m venv venv


Activate environment:

Windows:


venv\Scripts\activate


Linux / Mac:


source venv/bin/activate


Install dependencies:


pip install -r requirements.txt


---

# Running the Application

Start the server:


uvicorn app.main:app --reload


Open browser:


http://127.0.0.1:8000


---

# Demo Users

Admin user:


username: admin
password: admin123


Standard user:


username: viewer
password: viewer123


---

# API Endpoints

Health


GET /health


Incidents


GET /incidents
POST /incidents
PATCH /incidents/{id}
DELETE /incidents/{id}


Monitoring


POST /monitoring/check
GET /monitoring/stats


Logs


POST /logs/analyze


Auth


POST /auth/login


---

# Future Improvements

Possible improvements for production use:

- JWT authentication
- PostgreSQL database
- Docker containerization
- Kubernetes deployment
- Prometheus monitoring
- Grafana dashboards
- alerting system
- incident severity levels
- incident comments and history

---

# Purpose

This project was created as a **technical exercise to demonstrate application support workflows** and API-based monitoring tools.