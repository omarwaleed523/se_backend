import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { eventService } from '../../services/api';
import Loader from '../shared/Loader';
import { toast } from 'react-toastify';
import './EventStyles.css';

const MyEventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await eventService.getMyEvents();
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load your events');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async () => {
    try {
      setLoading(true);
      await eventService.deleteEvent(selectedEvent._id);
      toast.success('Event deleted successfully');
      setShowDeleteModal(false);
      fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error(error.response?.data?.message || 'Failed to delete event');
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

  const getStatusClass = (status) => {
    switch(status) {
      case 'approved': return 'status-approved';
      case 'pending': return 'status-pending';
      case 'declined': return 'status-declined';
      default: return '';
    }
  };

  if (loading && events.length === 0) return <Loader />;
  return (
    <div className="my-events-container">
      <div className="page-header">
        <h1>My Events</h1>
        <Link to="/my-events/new" className="create-event-btn">
          Create New Event
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="no-events-message">
          <p>You haven't created any events yet.</p>
          <Link to="/my-events/new" className="create-event-link">
            Create your first event
          </Link>
        </div>
      ) : (
        <div className="event-grid">
          {events.map(event => (
            <div key={event._id} className="event-card">
              <div className="event-image">
                {event.image ? (
                  <img src={event.image} alt={event.title} />
                ) : (
                  <div className="placeholder-image">
                    <span>{event.title.charAt(0)}</span>
                  </div>
                )}
                <div className={`event-status ${getStatusClass(event.status)}`}>
                  {event.status}
                </div>
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
                  
                  <div className="event-tickets">
                    <i className="icon">🎟️</i>
                    <span>{event.availableTickets} / {event.totalTickets} tickets available</span>
                  </div>
                </div>
                
                <div className="event-actions">
                  <Link to={`/events/${event._id}`} className="action-btn view">
                    View
                  </Link>
                  <Link to={`/my-events/${event._id}/edit`} className="action-btn edit">
                    Edit
                  </Link>
                  <button 
                    onClick={() => {
                      setSelectedEvent(event);
                      setShowDeleteModal(true);
                    }}
                    className="action-btn delete"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedEvent && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Confirm Deletion</h2>
            <p>
              Are you sure you want to delete the event <strong>"{selectedEvent.title}"</strong>?
              This action cannot be undone.
            </p>
            
            <div className="modal-actions">
              <button 
                onClick={handleDeleteEvent}
                className="action-btn delete"
                disabled={loading}
              >
                {loading ? 'Deleting...' : 'Delete Event'}
              </button>
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="action-btn cancel"
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyEventsPage;
