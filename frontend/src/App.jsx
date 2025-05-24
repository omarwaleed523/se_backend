import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

// Context
import { AuthProvider } from './context/AuthContext';

// Shared Components
import Navbar from './components/shared/Navbar';
import Footer from './components/shared/Footer';
import ProtectedRoute from './components/shared/ProtectedRoute';
import UnauthorizedPage from './components/shared/UnauthorizedPage';

// Auth Components
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import ForgotPassword from './components/auth/ForgotPassword';

// Profile Components
import ProfilePage from './components/profile/ProfilePage';

// Event Components
import EventList from './components/events/EventList';
import EventDetails from './components/events/EventDetails';
import EventForm from './components/events/EventForm';
import MyEventsPage from './components/events/MyEventsPage';
import EventAnalytics from './components/events/EventAnalytics';

// Booking Components
import UserBookingsPage from './components/bookings/UserBookingsPage';

// Admin Components
import AdminEventsPage from './components/admin/AdminEventsPage';
import AdminUsersPage from './components/admin/AdminUsersPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app-container">
          <Navbar />
          <main className="main-content">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<EventList />} />
              <Route path="/events/:id" element={<EventDetails />} />
              <Route path="/login" element={<LoginForm />} />
              <Route path="/register" element={<RegisterForm />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/unauthorized" element={<UnauthorizedPage />} />
              
              {/* Protected Routes - Any Authenticated User */}
              <Route element={<ProtectedRoute allowedRoles={['user', 'organizer', 'admin']} />}>
                <Route path="/profile" element={<ProfilePage />} />
              </Route>
              
              {/* Protected Routes - User */}
              <Route element={<ProtectedRoute allowedRoles={['user']} />}>
                <Route path="/bookings" element={<UserBookingsPage />} />
              </Route>
              
              {/* Protected Routes - Organizer */}
              <Route element={<ProtectedRoute allowedRoles={['organizer']} />}>
                <Route path="/my-events" element={<MyEventsPage />} />
                <Route path="/my-events/new" element={<EventForm />} />
                <Route path="/my-events/:id/edit" element={<EventForm />} />
                <Route path="/my-events/analytics" element={<EventAnalytics />} />
              </Route>
              
              {/* Protected Routes - Admin */}
              <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                <Route path="/admin/events" element={<AdminEventsPage />} />
                <Route path="/admin/users" element={<AdminUsersPage />} />
              </Route>
              
              {/* Catch All */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
          <Footer />
          <ToastContainer position="top-right" autoClose={5000} />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
