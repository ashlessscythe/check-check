Check-In/Check-Out App Documentation
Table of Contents

    Overview
    Functional Requirements
    Non-Functional Requirements
    Tech Stack
    Code Structure
    Authentication System
    Database Schemas
    Offline Syncing Logic
    WebSocket Integration Setup
    Testing and Deployment Guidelines

Overview

The Check-In/Check-Out App streamlines building access tracking for daily operations and emergency preparedness. It uses barcode scanning to log check-ins and check-outs, maintaining an up-to-date record of everyone currently inside the building. The app provides real-time visibility and a user-friendly interface for administrators and employees.
Functional Requirements

1. Barcode Scanning

   Users can scan their unique barcodes upon entry and exit.
   The system records the timestamp and user ID for each event.

2. Real-Time Tracking

   The app displays a live list of users currently in the building.
   Updates occur instantly across all connected devices via WebSockets.

3. Offline Mode with Syncing

   The app functions without an internet connection.
   Check-in/out events are stored locally during offline periods.
   Data syncs automatically when the device reconnects.
   An offline counter displays minutes since the last online connection.

4. Local Authentication

   Users authenticate using email and password.
   The system ensures secure access to authorized users only.

5. Admin Portal with RBAC

   Admins can manage users, roles, and permissions.
   The portal provides tools for monitoring activity and generating reports.
   Access is controlled based on user roles.

6. User History Tracking

   The app maintains logs of user check-in/out history.
   Admins can view and generate reports from these logs.

Non-Functional Requirements

1. Scalability

   The system supports a large number of users and high transaction volumes.

2. Performance

   Optimized for quick barcode scanning and minimal data sync times.

3. Security

   Data transmission uses SSL encryption.
   Authentication and access control prevent unauthorized access.

4. Accessibility

   The app is responsive and works on mobile devices and tablets.

Tech Stack
Backend

    Language: Node.js
    Framework: Express.js
    Database: PostgreSQL hosted on Neon.tech
    ORM: Prisma
    Authentication: JWT or session-based auth with email/password
    WebSockets: Socket.io or similar library

Frontend

    Framework: React.js
    State Management: Redux or Context API
    WebSockets: Socket.io-client or similar library
    Offline Storage: IndexedDB (using libraries like Dexie.js) or localStorage
    Barcode Scanning: HTML5 APIs or third-party libraries

Code Structure

project-root/
│
├── backend/
│ ├── src/
│ │ ├── controllers/
│ │ ├── middlewares/
│ │ ├── models/
│ │ ├── routes/
│ │ ├── services/
│ │ └── app.js
│ ├── prisma/
│ │ └── schema.prisma
│ ├── package.json
│ └── ...
│
├── frontend/
│ ├── src/
│ │ ├── components/
│ │ ├── pages/
│ │ ├── services/
│ │ ├── store/
│ │ ├── App.js
│ │ └── index.js
│ ├── public/
│ ├── package.json
│ └── ...
│
├── docs/
│ ├── docs.md
│ └── ...
├── todo.txt
└── ...

Authentication System

The application uses JWT (JSON Web Token) based authentication with role-based access control (RBAC).

Authentication Endpoints

1. Login (/api/auth/login)

   - Method: POST
   - Body: { email: string, password: string }
   - Response: { user: UserObject, token: string }
   - Description: Authenticates user credentials and returns a JWT token

2. Registration (/api/auth/register)
   - Method: POST
   - Body: { email: string, password: string }
   - Response: { user: UserObject, token: string }
   - Description: Creates a new user account with default "user" role

Authentication Middleware

The system provides three middleware functions for securing routes:

1. withAuth

   - Basic authentication check
   - Verifies JWT token and attaches user to request
   - Usage:
     ```typescript
     export default withAuth(async function handler(req: AuthRequest) {
       // Your route logic here
     });
     ```

2. requirePermission

   - Checks if user has specific permission
   - Must be used with withAuth
   - Usage:
     ```typescript
     export default requirePermission("check-in")(async function handler(
       req: AuthRequest
     ) {
       // Your route logic here
     });
     ```

3. requireRole
   - Checks if user has specific role
   - Must be used with withAuth
   - Usage:
     ```typescript
     export default requireRole("admin")(async function handler(
       req: AuthRequest
     ) {
       // Your route logic here
     });
     ```

Role-Based Access Control (RBAC)

1. Default Roles

   - user: Basic access for check-in/out operations
   - admin: Full access to all features

2. Default Permissions

   - User Role:
     - check-in: Ability to check into building
     - check-out: Ability to check out of building
     - view-own-history: View personal check-in/out history

3. JWT Token Structure
   ```json
   {
     "id": "user-uuid",
     "email": "user@example.com",
     "roleId": "role-uuid",
     "roleName": "user",
     "permissions": ["check-in", "check-out", "view-own-history"]
   }
   ```

Database Schemas
Prisma Schema (schema.prisma)

datasource db {
provider = "postgresql"
url = env("DATABASE_URL")
}

generator client {
provider = "prisma-client-js"
}

model User {
id String @id @default(uuid())
email String @unique
password String
role Role @relation(fields: [roleId], references: [id])
roleId String
CheckInOut CheckInOut[]
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt
}

model Role {
id String @id @default(uuid())
name String @unique
permissions Permission[]
users User[]
}

model Permission {
id String @id @default(uuid())
action String
roles Role[]
}

model CheckInOut {
id String @id @default(uuid())
user User @relation(fields: [userId], references: [id])
userId String
type EventType
timestamp DateTime @default(now())
synced Boolean @default(false)
}

enum EventType {
CHECK_IN
CHECK_OUT
}

Offline Syncing Logic
Frontend Implementation

    Local Storage: Use IndexedDB (via Dexie.js) to store events when offline.
    Sync Service:
        On app load and at regular intervals, check for connectivity.
        If online, read unsynced events from IndexedDB.
        Send unsynced events to the backend via API calls.
        Mark events as synced upon successful transmission.
    Offline Counter:
        Start a timer when the app goes offline.
        Display the duration of offline status in the UI.
        Reset the timer upon reconnection.

Backend Implementation

    API Endpoints:
        Accept bulk check-in/out events for syncing.
        Validate and store events in the database.
    Data Integrity:
        Use transactions to ensure all events are recorded correctly.
        Respond with success or error messages for each event.

WebSocket Integration Setup
Backend Setup

    Install Socket.io or a similar library.
    Initialize the WebSocket server in the backend app.
    On check-in/out events:
        Emit events to connected clients with relevant data (e.g., user ID, event type, timestamp).

Frontend Setup

    Install Socket.io-client or a similar library.
    Establish a WebSocket connection upon user login.
    Listen for check-in/out events from the server.
    Update the UI (e.g., the list of users in the building) in real-time.

Security Considerations

    Authentication:
        Use middleware to authenticate WebSocket connections.
        Ensure only authorized clients can receive events.
    Namespaces and Rooms:
        Use Socket.io namespaces or rooms to manage event broadcasting efficiently.

Testing and Deployment Guidelines
Testing
Unit Tests

    Backend:
        Test controllers, services, and middleware.
        Mock database interactions using Prisma's testing utilities.
    Frontend:
        Test components and services.
        Use Jest and React Testing Library.

Integration Tests

    Test API endpoints with real database connections.
    Use tools like SuperTest for HTTP request testing.

End-to-End Tests

    Use Cypress or Selenium to simulate user interactions.
    Test critical flows like authentication, check-in/out, and admin functions.

Tollgates (Checkpoints)

At the end of each development phase (as outlined in todo.txt), perform the following:

    Code Review: Have team members review code for quality and adherence to standards.
    Testing: Run relevant tests to ensure new features work and existing features are unaffected.
    Deployment to Staging: Deploy the current build to a staging environment.
    Verification: Manually test the application in staging to verify functionality.

Deployment
Staging Environment

    Set up a staging server similar to the production environment.
    Use environment variables to manage configurations.

Production Deployment

    Use CI/CD pipelines to automate deployment.
    Containerize the application using Docker for consistency.
    Monitor application logs and performance metrics post-deployment.

Security Checks

    Vulnerability Scanning: Use tools like OWASP ZAP.
    Dependency Auditing: Regularly update dependencies and fix known vulnerabilities.
    Penetration Testing: Conduct or outsource periodic security testing.
