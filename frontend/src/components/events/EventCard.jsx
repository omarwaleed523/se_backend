import { Link } from 'react-router-dom';
import './EventStyles.css';

const EventCard = ({ event }) => {
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

  // Function to determine ticket availability label and color
  const getAvailabilityInfo = () => {
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

  const availabilityInfo = getAvailabilityInfo();

  return (
    <div className="event-card">
      <div className="event-image">
        {event.image ? (
          <img src={event.image} alt={event.title} />
        ) : (
          <div className="placeholder-image">
            <span>{event.title.charAt(0)}</span>
          </div>
        )}
      </div>
      
      <div className="event-content">
        <h3 className="event-title">{event.title}</h3>
        
        <div className="event-details">
          <div className="event-date">
            <i className="icon">🗓️</i>
            <span>{formatDate(event.date)}</span>
          </div>
          
          <div className="event-location">
            <i className="icon">📍</i>
            <span>{event.location}</span>
          </div>
          
          <div className="event-price">
            <i className="icon">💰</i>
            <span>${event.price.toFixed(2)}</span>
          </div>
        </div>
        
        <div className={`event-availability ${availabilityInfo.colorClass}`}>
          {availabilityInfo.label}
        </div>
        
        <Link to={`/events/${event._id}`} className="view-details-btn">
          View Details
        </Link>
      </div>
    </div>
  );
};

export default EventCard;
