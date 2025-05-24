import { useState, useEffect } from 'react';
import { eventService } from '../../services/api';
import Loader from '../shared/Loader';
import { toast } from 'react-toastify';
import './AdminStyles.css';

const AdminEventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await eventService.getAllEvents();
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const openStatusModal = (event, initialStatus) => {
    setSelectedEvent(event);
    setNewStatus(initialStatus);
    setShowStatusModal(true);
  };

  const handleStatusChange = async () => {
    try {
      setLoading(true);
      await eventService.updateEventStatus(selectedEvent._id, newStatus);
      toast.success(`Event ${newStatus} successfully`);
      setShowStatusModal(false);
      fetchEvents();
    } catch (error) {
      console.error('Error updating event status:', error);
      toast.error('Failed to update event status');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const filteredEvents = events.filter(event => {
    if (filter === 'all') return true;
    return event.status === filter;
  });

  if (loading && events.length === 0) return <Loader />;

  return (
    <div className="admin-container">
      <h1>Event Management</h1>
      
      <div className="filter-tabs">
        <button 
          className={filter === 'all' ? 'active' : ''} 
          onClick={() => setFilter('all')}
        >
          All Events
        </button>
        <button 
          className={filter === 'pending' ? 'active' : ''} 
          onClick={() => setFilter('pending')}
        >
          Pending
        </button>
        <button 
          className={filter === 'approved' ? 'active' : ''} 
          onClick={() => setFilter('approved')}
        >
          Approved
        </button>
        <button 
          className={filter === 'declined' ? 'active' : ''} 
          onClick={() => setFilter('declined')}
        >
          Declined
        </button>
      </div>
      
      {filteredEvents.length === 0 ? (
        <div className="no-data">
          No {filter !== 'all' ? filter : ''} events found.
        </div>
      ) : (
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Organizer</th>
                <th>Date</th>
                <th>Location</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.map(event => (
                <tr key={event._id}>
                  <td>{event.title}</td>
                  <td>{event.organizer.name}</td>
                  <td>{formatDate(event.date)}</td>
                  <td>{event.location}</td>
                  <td>
                    <span className={`status-badge ${event.status}`}>
                      {event.status}
                    </span>
                  </td>
                  <td className="actions">
                    {event.status === 'pending' && (
                      <>
                        <button 
                          onClick={() => openStatusModal(event, 'approved')}
                          className="action-btn approve"
                        >
                          Approve
                        </button>
                        <button 
                          onClick={() => openStatusModal(event, 'declined')}
                          className="action-btn decline"
                        >
                          Decline
                        </button>
                      </>
                    )}
                    {event.status !== 'pending' && (
                      <button 
                        onClick={() => openStatusModal(event, event.status === 'approved' ? 'declined' : 'approved')}
                        className={`action-btn ${event.status === 'approved' ? 'decline' : 'approve'}`}
                      >
                        {event.status === 'approved' ? 'Decline' : 'Approve'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Status Update Modal */}
      {showStatusModal && selectedEvent && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Update Event Status</h2>
            <p>
              Are you sure you want to 
              <strong> {newStatus} </strong>
              the event <strong>"{selectedEvent.title}"</strong>?
            </p>
            
            <div className="modal-actions">
              <button 
                onClick={handleStatusChange}
                className={`action-btn ${newStatus}`}
                disabled={loading}
              >
                {loading ? 'Updating...' : `Confirm ${newStatus}`}
              </button>
              <button 
                onClick={() => setShowStatusModal(false)}
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

export default AdminEventsPage;
