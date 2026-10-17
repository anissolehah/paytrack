# PayTrack — Payment Operations Dashboard

## Overview
PayTrack is a full-stack web application for managing payment issues. Users can register, log in, and manage payment issue records through a dashboard.

## Technologies
- Java
- Spring Boot
- MySQL
- HTML, CSS, JavaScript
- Maven
- Git and GitHub

## Features
- User registration and login
- Create, view, update, and delete payment issues
- Search and filter payment issues
- Manage issue status and priority
- Dashboard summary showing total, open, and resolved issues
- Separate frontend and backend

## Project Structure
```text
paytrack/
├── src/
│   └── main/
│       ├── java/
│       └── resources/
│           └── application.properties
├── frontend/
│   ├── index.html
│   ├── login.html
│   ├── register.html
│   ├── style.css
│   └── script.js
├── pom.xml
├── mvnw.cmd
└── README.md
```

## Prerequisites
- Java JDK
- MySQL Server
- Web browser

## Setup Instructions

### 1. Clone the repository
```bash
git clone https://github.com/anissolehah/paytrack
cd paytrack
```

### 2. Configure the database
Create the required MySQL database and configure the connection in `src/main/resources/application.properties`.

Use your own database credentials. Do not publish passwords or other sensitive information.

### 3. Run the backend
In the project root, run:

**Windows PowerShell**
```powershell
.\mvnw.cmd spring-boot:run
```

The backend should start on the port configured in your application.

### 4. Open the frontend
Open `frontend/login.html` in your web browser to access the login page.

Ensure the backend and database are running before using the application.

## Security
- Keep database credentials private.
- Do not commit passwords, API keys, or other secrets to GitHub.
