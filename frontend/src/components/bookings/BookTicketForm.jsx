import { useState } from 'react';
import { bookingService } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import './BookingStyles.css';

const BookTicketForm = ({ event }) => {
  const [ticketCount, setTicketCount] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleTicketChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0 && value <= event.availableTickets) {
      setTicketCount(value);
    }
  };

  const calculateTotal = () => {
    return (event.price * ticketCount).toFixed(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const bookingData = {
        eventId: event._id,
        ticketCount
      };

      await bookingService.createBooking(bookingData);
      toast.success('Booking confirmed successfully!');
      navigate('/bookings');
    } catch (error) {
      console.error('Booking error:', error);
      toast.error(error.response?.data?.message || 'Failed to book tickets');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="booking-form-container">
      <form onSubmit={handleSubmit} className="booking-form">
        <div className="form-group">
          <label htmlFor="ticketCount">Number of Tickets</label>
          <div className="ticket-counter">
            <button 
              type="button" 
              onClick={() => ticketCount > 1 && setTicketCount(ticketCount - 1)}
              className="counter-button"
            >
              -
            </button>
            <input
              type="number"
              id="ticketCount"
              min="1"
              max={event.availableTickets}
              value={ticketCount}
              onChange={handleTicketChange}
            />
            <button 
              type="button" 
              onClick={() => ticketCount < event.availableTickets && setTicketCount(ticketCount + 1)}
              className="counter-button"
            >
              +
            </button>
          </div>
        </div>
        
        <div className="booking-summary">
          <div className="summary-row">
            <span>Price per ticket:</span>
            <span>${event.price.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Number of tickets:</span>
            <span>{ticketCount}</span>
          </div>
          <div className="summary-row total">
            <span>Total:</span>
            <span>${calculateTotal()}</span>
          </div>
        </div>
        
        <button 
          type="submit" 
          className="book-button" 
          disabled={loading || ticketCount < 1}
        >
          {loading ? 'Processing...' : 'Book Tickets'}
        </button>
      </form>
    </div>
  );
};

export default BookTicketForm;
