# Online Event Ticketing System

A complete backend implementation for an Online Event Ticketing System, built with Node.js, Express, and MongoDB.

## Project Overview

This system allows:
- Authentication and role-based access control (Users, Organizers, Admins)
- User profile management
- Event creation, approval, and management
- Ticket booking and cancellation
- Analytics for event organizers

## Technology Stack

- **Language**: JavaScript
- **Backend**: Node.js, Express
- **Database**: MongoDB (mongoose)
- **Authentication**: JSON Web Tokens (JWT) and bcrypt

## Project Structure

```
.
├── src/
│   ├── index.js              # Main application entry point
│   ├── models/               # Database models
│   │   ├── user.model.js     # User model
│   │   ├── event.model.js    # Event model
│   │   └── booking.model.js  # Booking model
│   ├── routes/               # API routes
│   │   ├── auth.routes.js    # Authentication routes
│   │   ├── user.routes.js    # User management routes
│   │   ├── event.routes.js   # Event management routes
│   │   └── booking.routes.js # Booking management routes
│   └── middleware/           # Custom middleware
│       └── auth.middleware.js # Authentication middleware
├── .env                      # Environment variables
└── package.json              # Project dependencies
```

## Installation & Setup

1. **Clone the repository**

2. **Install dependencies**
   ```
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory with the following variables:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/event-ticketing-system
   JWT_SECRET=your_secure_jwt_secret_key
   NODE_ENV=development
   ```

4. **Start the MongoDB server**
   Make sure MongoDB is running on your system.

5. **Start the server**
   ```
   # Development mode with auto-reload
   npm run dev
   
   # Production mode
   npm start
   ```

## API Endpoints

### Authentication

- **POST /api/v1/register** - Register a new user
- **POST /api/v1/login** - Login a user
- **PUT /api/v1/forgotPassword** - Reset password

### User Management

- **GET /api/v1/users** - Get all users (Admin only)
- **GET /api/v1/users/profile** - Get user profile
- **PUT /api/v1/users/profile** - Update user profile
- **GET /api/v1/users/:id** - Get user by ID (Admin only)
- **PUT /api/v1/users/:id/role** - Update user role (Admin only)
- **DELETE /api/v1/users/:id** - Delete user (Admin only)

### Events Management

- **GET /api/v1/events** - Get all approved events (Public)
- **GET /api/v1/events/:id** - Get event by ID (Public)
- **POST /api/v1/events** - Create new event (Organizer only)
- **PUT /api/v1/events/:id** - Update event (Organizer only)
- **DELETE /api/v1/events/:id** - Delete event (Organizer only)
- **GET /api/v1/events/my-events** - Get organizer's events (Organizer only)
- **GET /api/v1/events/:id/analytics** - Get event analytics (Organizer only)
- **PUT /api/v1/events/:id/status** - Approve/reject event (Admin only)
- **GET /api/v1/events/admin/pending** - Get pending events (Admin only)

### Booking Management

- **GET /api/v1/bookings/my-bookings** - Get user's bookings
- **GET /api/v1/bookings/:id** - Get booking by ID
- **POST /api/v1/bookings** - Create new booking (User only)
- **PUT /api/v1/bookings/:id/cancel** - Cancel booking (User only)
- **GET /api/v1/bookings** - Get all bookings (Admin only)
- **GET /api/v1/bookings/event/:eventId** - Get bookings for an event (Organizer only)

## Testing the API

You can use tools like Postman or Thunder Client to test the API endpoints. Make sure to:

1. First register a user and get the JWT token
2. Use the token in the Authorization header for protected routes:
   ```
   Authorization: Bearer <your_jwt_token>
   ```

## User Roles

- **User**: Can browse events, book tickets, and manage their bookings
- **Organizer**: Can create events, edit their events, and view analytics
- **Admin**: Can approve/reject events and manage all users

## Error Handling

The API includes comprehensive error handling for:
- Route not found
- Invalid input validation
- Database errors
- Authentication/Authorization errors