# Smart Campus Operations Hub

A full-stack web application for managing university campus facilities, resource bookings, incident tickets, and user administration. Built with **Spring Boot 3** on the backend and **React + TypeScript (Vite)** on the frontend.

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
  - [Database Setup](#database-setup)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Default Credentials](#default-credentials)
- [API Reference](#api-reference)
  - [Authentication](#authentication)
  - [Resources](#resources)
  - [Bookings](#bookings)
  - [Tickets (Incidents)](#tickets-incidents)
  - [Notifications](#notifications)
  - [Users](#users)
  - [Dashboard](#dashboard)
- [Environment Configuration](#environment-configuration)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

**Smart Campus Operations Hub** is designed to digitise day-to-day campus operations for educational institutions. It provides a centralised platform where:

- **Administrators** can manage campus resources (rooms, labs, equipment), approve / reject booking requests, handle incident tickets, generate QR codes for check-in, and manage users.
- **Students / Users** can browse available facilities, book resources with conflict-free scheduling, scan QR codes to check in, raise maintenance or incident tickets, and receive real-time notifications.

The platform supports **Google OAuth 2.0** single sign-on alongside traditional email/password authentication with **OTP-based email verification**.

---

## Key Features

### Authentication and Authorisation
- JWT-based stateless authentication
- Google OAuth 2.0 (one-click sign-in)
- Email/password registration with OTP email verification
- Role-based access control (ADMIN, STUDENT, USER)
- Automatic admin notification on new user registration

### Facilities and Resource Management
- CRUD operations for campus resources (rooms, labs, equipment, etc.)
- Categorisation via Resource Types
- Resource status tracking (ACTIVE, OUT_OF_SERVICE, MAINTENANCE)
- Image upload support for resources
- Paginated resource listing with search and type-based filtering
- Soft delete for resources
- Public resource feed (no authentication required)

### Booking System
- Time-slot based resource booking with conflict detection
- Booking lifecycle: PENDING to APPROVED / REJECTED to CANCELLED
- Admin approval / rejection workflow with reason tracking
- User booking history with status filtering
- Availability calendar visualisation (react-big-calendar)
- Expected attendee count and purpose tracking

### QR Code Check-In
- Admin-generated resource-specific QR codes
- Camera-based QR scanning for users (html5-qrcode)
- Time-window enforcement (15 min before to 30 min after booking start)
- CHECKED_IN booking status upon successful scan

### Incident / Ticket Management
- Create, view, and manage maintenance and incident tickets
- Ticket lifecycle: OPEN to IN_PROGRESS to RESOLVED / CLOSED
- Priority levels and category classification
- Technician assignment
- Comment threads and file attachment support
- Resolution notes

### Notification System
- In-app notification panel with unread count badge
- Notification types: BOOKING, TICKET, SYSTEM
- Mark as read (individual / bulk)
- Delete notifications (individual / all)
- Admin broadcast notifications on new registrations

### User Management (Admin)
- View all registered users
- Change user roles (ADMIN, STUDENT, USER)
- Block / Unblock user accounts
- View individual user profiles

### Admin Dashboard
- Total and active resource counts
- Booking statistics (total, pending)
- Top 5 most-booked resources (recharts)

---

## Tech Stack

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Java | 17 | Language |
| Spring Boot | 3.2.3 | Application framework |
| Spring Security | -- | Authentication and authorisation |
| Spring Data JPA | -- | ORM / database access |
| Spring Mail | -- | Email (OTP verification) |
| MySQL | 8.x | Primary database |
| JJWT | 0.12.6 | JWT token generation and validation |
| Google API Client | 2.7.0 | Google OAuth ID token verification |
| Lombok | 1.18.38 | Boilerplate reduction |
| Maven | -- | Build tool |

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 18.2 | UI library |
| TypeScript | 5.2 | Type-safe JavaScript |
| Vite | 5.2 | Build tool and dev server |
| React Router | 7.x | Client-side routing |
| Axios | 1.6.8 | HTTP client |
| TailwindCSS | 3.4 | Utility-first CSS |
| Bootstrap | 5.3 | UI components |
| Recharts | 3.8 | Charts and data visualisation |
| React Big Calendar | 1.19 | Calendar / scheduling view |
| Lucide React | 1.7 | Icon library |
| html5-qrcode | 2.3.8 | QR code scanning |
| qrcode.react | 4.2 | QR code generation |
| react-hot-toast | 2.6 | Toast notifications |
| @react-oauth/google | 0.13 | Google OAuth integration |
| jwt-decode | 4.0 | JWT token decoding |
| date-fns | 4.1 | Date utility library |

---

## Architecture

The application follows a three-tier architecture:

- Presentation Layer (Frontend) -- A React single-page application built with Vite and TypeScript, running on http://localhost:5173. It communicates with the backend exclusively via REST API calls using Axios, with JWT tokens attached in the Authorization header.

- Application Layer (Backend) -- A Spring Boot 3 application running on http://localhost:8081. It is structured into Controllers (REST endpoints), Services (business logic), and Repositories (data access via Spring Data JPA). Security is handled by Spring Security with a custom JWT authentication filter and Google OAuth 2.0 integration.

- Data Layer (Database) -- A MySQL 8.x relational database (smartcampus schema) accessed via JDBC through Hibernate ORM. The schema is auto-managed by Hibernate with ddl-auto=update.

---

## Project Structure

The project root contains two main directories: backend and frontend.

The backend directory holds the Spring Boot application. The Maven configuration is defined in pom.xml. The main source code resides under src/main/java/com/smartcampus/, starting with SmartCampusApplication.java as the entry point. The config package contains SecurityConfig.java (CORS, JWT filter, endpoint security rules), DataSeeder.java (seeds the default admin account on first run), DatabaseMigration.java (schema migration helpers), and WebMvcConfig.java (static resource serving configuration). The controller package exposes REST endpoints through AuthController.java (login, register, Google OAuth, OTP verification), ResourceController.java (CRUD for campus resources), BookingController.java (booking lifecycle and QR check-in), TicketController.java (incident ticket management), NotificationController.java, UserController.java (admin user management), and DashboardController.java (statistics endpoint). The dto package holds Data Transfer Objects such as AuthResponse, BookingDto, ResourceDto, NotificationDto, UserProfileDto, and others. The exception package contains GlobalExceptionHandler.java along with custom exceptions like BookingConflictException, ResourceNotFoundException, and ValidationException. The model package is split into entity and enums sub-packages. The entity sub-package defines JPA entities: User.java, Resource.java, ResourceType.java, Booking.java, Ticket.java, and Notification.java. The enums sub-package defines BookingStatus, ResourceStatus, and NotificationType. The repository package contains Spring Data JPA repositories for each entity. The security package includes JwtService.java (JWT generation and validation) and JwtAuthenticationFilter.java. The service package contains business logic implementations including AuthService, BookingServiceImpl, ResourceServiceImpl, TicketService, NotificationServiceImpl, DashboardServiceImpl, and EmailService. Application configuration lives in src/main/resources/application.properties. Uploaded resource images are stored in the uploads directory.

The frontend directory holds the React application built with Vite. Configuration files include package.json, vite.config.ts, tailwind.config.js, tsconfig.json, and index.html. The source code is under the src directory. App.tsx defines all route configurations and main.tsx is the application entry point. The api directory contains Axios service modules: client.ts (Axios instance with JWT interceptor), authApi.ts, resourceApi.ts, bookingApi.ts, facilityApi.ts, notificationApi.ts, and userApi.ts. The components directory is organised into sub-directories: layout (MainLayout.tsx, Header.tsx, Sidebar.tsx, Footer.tsx, NotificationPanel.tsx), facilities (FacilitiesList.tsx, FacilityCard.tsx, ResourceAvailabilityCalendar.tsx), tickets (AttachmentUpload.jsx, CommentsSection.jsx, StatusUpdate.jsx, TechnicianAssign.jsx), and common (StatusBadge.tsx). ProtectedRoute.tsx provides authentication and role-based route guards. The contexts directory contains AuthContext.tsx for authentication state management. The pages directory includes Login.tsx, Register.tsx, Profile.tsx, UserManagement.tsx, and Notifications.tsx at the top level. The facilities sub-directory contains Dashboard.tsx (admin analytics), ResourceList.tsx (browse resources), ResourceFeed.tsx (public feed), ResourceDetails.tsx (detail view with booking), AddResource.tsx and EditResource.tsx (admin resource forms), ManageResources.tsx (admin resource management), MyBookings.tsx (user booking history), ManageBookings.tsx (admin booking approval), QRCodeGenerator.tsx (admin QR code generation), and QRScanner.tsx (user check-in scanner). The tickets sub-directory contains TicketModule.jsx (main ticket view), CreateTicketPage.jsx, TicketListPage.jsx, and TicketDetailsPage.jsx. The types directory defines TypeScript interfaces in facility.ts and resource.ts.

---

## Prerequisites

| Software | Required Version |
|---|---|
| Java JDK | 17+ |
| Node.js | 18+ (with npm) |
| MySQL | 8.x (via XAMPP, Docker, or standalone) |
| Maven | 3.9+ (or use the included mvnw.cmd wrapper) |
| Git | Latest |

---

## Getting Started

### Database Setup

1. Start your MySQL server (e.g., via XAMPP, Docker, or system service).
2. The application will auto-create the smartcampus database on first run (configured via createDatabaseIfNotExist=true).
3. Tables are auto-generated by Hibernate (ddl-auto=update).

Note: Default MySQL config uses root with an empty password on localhost:3306. Update application.properties if your setup differs.

---

### Backend Setup

```bash
# Navigate to the backend directory
cd backend

# Build the project (skip tests for faster startup)
./mvnw.cmd clean install -DskipTests

# Run the application
./mvnw.cmd spring-boot:run
```

The backend starts on http://localhost:8081.

On first run, the DataSeeder will create the default admin account (see Default Credentials).

---

### Frontend Setup

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend starts on http://localhost:5173.

---

## Default Credentials

The application seeds the following admin account on first startup:

| Role | Email | Password |
|---|---|---|
| Admin | admin@gmail.com | admin@123 |

Student login: Students do not require a pre-seeded account. They can sign in using Google OAuth, and a new account with the STUDENT role is created automatically on first login.

---

## API Reference

Base URL: http://localhost:8081

All authenticated endpoints require the header:
```
Authorization: Bearer <JWT_TOKEN>
```

### Authentication

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | /api/v1/auth/register | No | Register with email/password |
| POST | /api/v1/auth/verify-otp | No | Verify email with OTP |
| POST | /api/v1/auth/login | No | Login with email/password |
| POST | /api/v1/auth/google | No | Login / register via Google OAuth |
| GET | /api/v1/auth/me | Yes | Get current authenticated user |

### Resources

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | /api/v1/resources?page=0&size=10&search=&typeId= | No | List resources (paginated, filterable) |
| GET | /api/v1/resources/{id} | No | Get resource details |
| POST | /api/v1/resources | Admin | Create a resource |
| PUT | /api/v1/resources/{id} | Admin | Update a resource |
| DELETE | /api/v1/resources/{id} | Admin | Soft-delete a resource |
| POST | /api/v1/resources/upload | Admin | Upload resource image |

### Bookings

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | /api/v1/bookings | Yes | List all bookings (optional ?status=) |
| GET | /api/v1/bookings/{id} | Yes | Get booking by ID |
| GET | /api/v1/bookings/user/{userId} | Yes | Get user bookings (optional ?status=) |
| GET | /api/v1/bookings/resource/{resourceId} | Yes | Get bookings for a resource |
| POST | /api/v1/bookings | Yes | Create a booking |
| PUT | /api/v1/bookings/{id}/approve | Admin | Approve a booking |
| PUT | /api/v1/bookings/{id}/reject | Admin | Reject a booking (with reason) |
| PATCH | /api/v1/bookings/{id}/cancel | Yes | Cancel a booking |
| DELETE | /api/v1/bookings/{id} | Admin | Delete a booking |
| POST | /api/v1/bookings/checkin | Yes | QR-based check-in |

### Tickets (Incidents)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | /api/tickets | No | List all tickets |
| GET | /api/tickets/{id} | No | Get ticket by ID |
| POST | /api/tickets | No | Create a ticket |
| PUT | /api/tickets/{id}/status | No | Update ticket status |
| PUT | /api/tickets/{id}/assign-technician | No | Assign a technician |
| POST | /api/tickets/{id}/comments | No | Add a comment |
| DELETE | /api/tickets/{id}/comments/{index} | No | Delete a comment |
| POST | /api/tickets/{id}/attachments | No | Add an attachment |
| DELETE | /api/tickets/{id}/attachments/{index} | No | Delete an attachment |

### Notifications

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | /api/v1/notifications | Yes | Get my notifications |
| GET | /api/v1/notifications/unread-count | Yes | Get unread count |
| PATCH | /api/v1/notifications/{id}/read | Yes | Mark one as read |
| PATCH | /api/v1/notifications/read-all | Yes | Mark all as read |
| DELETE | /api/v1/notifications/{id} | Yes | Delete a notification |
| DELETE | /api/v1/notifications/all | Yes | Delete all notifications |

### Users

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | /api/v1/users | Admin | List all users |
| GET | /api/v1/users/{id} | Admin | Get user by ID |
| PATCH | /api/v1/users/{id}/role | Admin | Update user role |
| PATCH | /api/v1/users/{id}/status | Admin | Block / unblock user |

### Dashboard

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | /api/v1/dashboard | Yes | Get dashboard statistics |

---

## Environment Configuration

### Backend -- backend/src/main/resources/application.properties

| Property | Default | Description |
|---|---|---|
| server.port | 8081 | Backend server port |
| spring.datasource.url | jdbc:mysql://localhost:3306/smartcampus | MySQL connection URL |
| spring.datasource.username | root | Database username |
| spring.datasource.password | (empty) | Database password |
| app.jwt.secret | (base64 encoded key) | JWT signing secret |
| app.jwt.expiration-ms | 86400000 (24h) | JWT token expiry |
| app.google.client-id | (configured) | Google OAuth 2.0 client ID |
| spring.mail.username | (configure) | Gmail address for OTP emails |
| spring.mail.password | (configure) | Gmail App Password |

### Frontend

The Google OAuth client ID is configured in src/App.tsx. Update it if using a different Google Cloud project:

```typescript
const GOOGLE_CLIENT_ID = 'your-google-client-id.apps.googleusercontent.com';
```

---

## Contributing

1. Fork the repository
2. Create a feature branch (git checkout -b feature/my-feature)
3. Commit your changes (git commit -m 'Add some feature')
4. Push to the branch (git push origin feature/my-feature)
5. Open a Pull Request

---

## License

This project is developed as part of the Platform for Advanced Frameworks (PAF) module -- 3rd Year, 2nd Semester.
