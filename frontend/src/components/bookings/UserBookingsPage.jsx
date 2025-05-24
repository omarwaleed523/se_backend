import { useState, useEffect } from 'react';
import { bookingService } from '../../services/api';
import Loader from '../shared/Loader';
import { toast } from 'react-toastify';
import './BookingStyles.css';

const UserBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await bookingService.getMyBookings();
      setBookings(response.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to load your bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      setLoading(true);
      await bookingService.cancelBooking(bookingId);
      toast.success('Booking cancelled successfully');
      fetchBookings();
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast.error(error.response?.data?.message || 'Failed to cancel booking');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && bookings.length === 0) return <Loader />;

  return (
    <div className="bookings-container">
      <h1>My Bookings</h1>

      {bookings.length === 0 ? (
        <div className="no-bookings">
          <p>You don't have any bookings yet.</p>
          <a href="/" className="browse-events-btn">Browse Events</a>
        </div>
      ) : (
        <div className="bookings-list">
          {bookings.map(booking => (
            <div key={booking._id} className="booking-card">
              <div className="booking-event-image">
                {booking.event.image ? (
                  <img src={booking.event.image} alt={booking.event.title} />
                ) : (
                  <div className="placeholder-image">
                    <span>{booking.event.title.charAt(0)}</span>
                  </div>
                )}
              </div>
              
              <div className="booking-details">
                <h3>{booking.event.title}</h3>
                
                <div className="booking-info-row">
                  <span className="label">Date:</span>
                  <span>{formatDate(booking.event.date)}</span>
                </div>
                
                <div className="booking-info-row">
                  <span className="label">Location:</span>
                  <span>{booking.event.location}</span>
                </div>
                
                <div className="booking-info-row">
                  <span className="label">Tickets:</span>
                  <span>{booking.ticketCount}</span>
                </div>
                
                <div className="booking-info-row">
                  <span className="label">Total Price:</span>
                  <span>${booking.totalPrice.toFixed(2)}</span>
                </div>
                
                <div className="booking-info-row">
                  <span className="label">Status:</span>
                  <span className={`booking-status ${booking.status}`}>
                    {booking.status}
                  </span>
                </div>
                
                <div className="booking-info-row">
                  <span className="label">Booked On:</span>
                  <span>{formatDate(booking.createdAt)}</span>
                </div>
                
                {booking.status === 'confirmed' && (
                  <button 
                    onClick={() => handleCancelBooking(booking._id)}
                    className="cancel-booking-btn"
                  >
                    Cancel Booking
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserBookingsPage;
