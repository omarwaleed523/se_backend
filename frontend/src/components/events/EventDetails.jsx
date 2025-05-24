import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { eventService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Loader from '../shared/Loader';
import BookTicketForm from '../bookings/BookTicketForm';
import './EventStyles.css';
import { toast } from 'react-toastify';

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, hasRole } = useAuth();
  
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const response = await eventService.getEventById(id);
        setEvent(response.data);
      } catch (error) {
        console.error('Error fetching event details:', error);
        setError('Failed to load event details');
        toast.error('Failed to load event details');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getAvailabilityInfo = () => {
    if (!event) return {};
    
    if (event.availableTickets === 0) {
      return {
        label: 'Sold Out',
        colorClass: 'sold-out'
      };
    } else if (event.availableTickets <= 5) {
      return {
        label: `Only ${event.availableTickets} tickets left!`,
        colorClass: 'low-availability'
      };
    } else {
      return {
        label: `${event.availableTickets} tickets available`,
        colorClass: 'available'
      };
    }
  };

  if (loading) return <Loader />;
  if (error) return <div className="error-message">{error}</div>;
  if (!event) return <div className="error-message">Event not found</div>;

  const availabilityInfo = getAvailabilityInfo();
  const isOrganizer = hasRole('organizer') && 
    event.organizer._id === JSON.parse(localStorage.getItem('user')).id;

  return (
    <div className="event-details-container">
      <div className="event-header">
        <h1>{event.title}</h1>
        {isOrganizer && (
          <div className="organizer-actions">
            <button 
              onClick={() => navigate(`/my-events/${event._id}/edit`)}
              className="edit-button"
            >
              Edit Event
            </button>
          </div>
        )}
      </div>
      
      <div className="event-content-wrapper">
        <div className="event-main-content">
          <div className="event-image-large">
            {event.image ? (
              <img src={event.image} alt={event.title} />
            ) : (
              <div className="placeholder-image-large">
                <span>{event.title.charAt(0)}</span>
              </div>
            )}
          </div>
          
          <div className="event-info-section">
            <h2>About This Event</h2>
            <p className="event-description">{event.description}</p>
          </div>
          
          <div className="event-info-section">
            <h2>Event Details</h2>
            <div className="event-detail-item">
              <span className="label">Date & Time:</span>
              <span>{formatDate(event.date)}</span>
            </div>
            <div className="event-detail-item">
              <span className="label">Location:</span>
              <span>{event.location}</span>
            </div>
            <div className="event-detail-item">
              <span className="label">Category:</span>
              <span>{event.category}</span>
            </div>
            <div className="event-detail-item">
              <span className="label">Organizer:</span>
              <span>{event.organizer.name}</span>
            </div>
          </div>
        </div>
        
        <div className="event-sidebar">
          <div className="ticket-info-card">
            <h3>Ticket Information</h3>
            <div className="ticket-price">
              <span className="label">Price:</span>
              <span className="price">${event.price.toFixed(2)}</span>
            </div>
            
            <div className={`ticket-availability ${availabilityInfo.colorClass}`}>
              {availabilityInfo.label}
            </div>
            
            {isAuthenticated && hasRole('user') && event.availableTickets > 0 ? (
              <BookTicketForm event={event} />
            ) : isAuthenticated ? (
              <div className="booking-info">
                {event.availableTickets === 0 ? (
                  <p>This event is sold out!</p>
                ) : (
                  <p>You need a user account to book tickets.</p>
                )}
              </div>
            ) : (
              <div className="booking-info">
                <p>Please <a href="/login">login</a> to book tickets.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
