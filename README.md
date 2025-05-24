# Event Ticketing System

A full-stack web application for event management and ticket booking built with the MERN stack (MongoDB, Express, React, Node.js).

## Project Structure

This project is organized into two main directories:

- `backend/` - Express.js API server
- `frontend/` - React SPA client

## Features

- **User Authentication**: Register, login, and password recovery
- **Multiple User Roles**: Admin, Event Organizer, and Regular User
- **Event Management**: Create, view, update, and delete events
- **Approval Workflow**: Admin approval for events before they go live
- **Ticket Booking**: Book tickets for events with real-time seat availability
- **Analytics**: Event performance tracking for organizers
- **Responsive UI**: Mobile-friendly interface

## Getting Started

### Prerequisites

- Node.js (v14+)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/event-ticketing-system.git
cd event-ticketing-system
```

2. Install backend dependencies
```bash
cd backend
npm install
```

3. Install frontend dependencies
```bash
cd ../frontend
npm install
```

### Configuration

1. Create a `.env` file in the backend directory with the following variables:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/event-ticketing-system
JWT_SECRET=your_jwt_secret_key
```

### Running the Application

1. Start the backend server
```bash
cd backend
npm run dev
```

2. Start the frontend development server
```bash
cd frontend
npm run dev
```

3. Access the application at `http://localhost:5173`

## API Documentation

The API is organized around RESTful endpoints:

- `/api/v1/` - Authentication routes
- `/api/v1/users` - User management
- `/api/v1/events` - Event management
- `/api/v1/bookings` - Ticket booking

## User Roles

- **Admin**: Approve/reject events, manage users
- **Organizer**: Create and manage events, view event analytics
- **User**: Browse events, book tickets, manage bookings

## License

This project is licensed under the MIT License - see the LICENSE file for details.
