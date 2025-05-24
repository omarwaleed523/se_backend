# Event Ticketing System - Frontend

This is the client-side component of the Event Ticketing System, built with React, Vite, and modern React hooks.

## Features

- Modern React with functional components and hooks
- Context API for state management
- Responsive design with custom CSS
- Role-based UI components
- Interactive event browsing, filtering, and booking
- Secure authentication with JWT

## Project Structure

```
src/
├── App.jsx                   # Main application component
├── main.jsx                  # Application entry point
├── assets/                   # Static assets
├── components/               # React components
│   ├── admin/                # Admin-specific components
│   ├── auth/                 # Authentication components
│   ├── bookings/             # Booking-related components
│   ├── events/               # Event-related components
│   ├── profile/              # User profile components
│   └── shared/               # Shared UI components
├── context/                  # Context providers
│   └── AuthContext.jsx       # Authentication context
└── services/                 # API services
    └── api.js                # Axios API configuration
```

## Key Components

### Authentication
- Login and registration forms
- Password recovery
- JWT token handling with Axios interceptors

### Event Management
- Event listing with filters and search
- Event creation and editing for organizers
- Event approval for admins
- Event analytics for organizers

### Booking System
- Ticket booking forms
- Booking management
- Ticket cancellation

## Setup & Development

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

### Building for Production
```bash
npm run build
```

### Environment Variables
Create a `.env` file in the root directory with:
```
VITE_API_URL=http://localhost:5000/api/v1
```

## User Roles and Access

- **Admin**: Full access to user management, event approval
- **Organizer**: Event creation and management, analytics
- **User**: Event browsing, ticket booking, profile management

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
