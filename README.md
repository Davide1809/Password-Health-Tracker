# Password Health Tracker

## Project Overview
Password Health Tracker is a web application designed to help users monitor and improve password security. The MVP focuses on user account management and password strength checking, providing real-time feedback and AI-assisted suggestions.

## Features

### MVP (Sprint 1)
- User Account Management
  - Signup / Login
- Password Strength Checker
  - Real-time feedback on password security

### Future Features (Sprint 2+)
- Password History Tracking
- Password Reset
- AI Suggestions for stronger passwords
- Security Insights

## Technology Stack
- Frontend: React.js
- Backend: Python / Flask
- Database: MongoDB
- AI Integration: GitHub Copilot, ChatGPT
- Deployment: Docker, Google Cloud Platform (Cloud Run)
- CI/CD: GitHub Actions

## User Management - Signup Feature

**User Story:** As a new user, I want to create an account so that I can access the application.

**Feature Status:** MVP Completed

### Functionality
- New users can register with email and password
- Email format validation (frontend + backend)
- Password security requirements:
  - At least 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
  - At least one symbol
- Confirmation message on successful registration
- Redirect to dashboard after signup
- Error messages for invalid inputs or already registered emails

### AI Tools Used
- **GitHub Copilot**: Assisted in React components (`Signup.jsx`) and helper functions (`validators.js`)
- **ChatGPT**: Helped design backend API, validation logic, and suggested security best practices

### Setup Instructions for Signup Feature
1. **Backend Setup (Flask + MongoDB)**
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python app.py
