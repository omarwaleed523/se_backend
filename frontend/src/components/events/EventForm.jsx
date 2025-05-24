import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { eventService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Loader from '../shared/Loader';
import './EventStyles.css';
import { toast } from 'react-toastify';

const EventForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    price: '',
    totalTickets: '',
    category: '',
    image: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!hasRole('organizer')) {
      navigate('/unauthorized');
      return;
    }

    if (isEditing) {
      const fetchEvent = async () => {
        try {
          setLoading(true);
          const response = await eventService.getEventById(id);
          const event = response.data;
          
          // Format date for input
          const eventDate = new Date(event.date);
          const formattedDate = eventDate.toISOString().slice(0, 16);
          
          setFormData({
            title: event.title,
            description: event.description,
            date: formattedDate,
            location: event.location,
            price: event.price,
            totalTickets: event.totalTickets,
            category: event.category,
            image: event.image
          });
        } catch (error) {
          console.error('Error fetching event:', error);
          toast.error('Failed to load event data');
        } finally {
          setLoading(false);
        }
      };

      fetchEvent();
    }
  }, [id, isEditing, navigate, hasRole]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title) newErrors.title = 'Title is required';
    if (!formData.description) newErrors.description = 'Description is required';
    if (!formData.date) newErrors.date = 'Date is required';
    if (!formData.location) newErrors.location = 'Location is required';
    if (!formData.price) newErrors.price = 'Price is required';
    if (formData.price <= 0) newErrors.price = 'Price must be greater than 0';
    if (!formData.totalTickets) newErrors.totalTickets = 'Number of tickets is required';
    if (formData.totalTickets <= 0) newErrors.totalTickets = 'Number of tickets must be greater than 0';
    if (!formData.category) newErrors.category = 'Category is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setSubmitting(true);
    
    try {
      if (isEditing) {
        await eventService.updateEvent(id, formData);
        toast.success('Event updated successfully');
      } else {
        await eventService.createEvent(formData);
        toast.success('Event created successfully');
      }
      navigate('/my-events');
    } catch (error) {
      console.error('Error saving event:', error);
      toast.error(error.response?.data?.message || 'Failed to save event');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="event-form-container">
      <h2>{isEditing ? 'Edit Event' : 'Create New Event'}</h2>
      
      <form onSubmit={handleSubmit} className="event-form">
        <div className="form-group">
          <label htmlFor="title">Event Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className={errors.title ? 'error' : ''}
          />
          {errors.title && <span className="error-message">{errors.title}</span>}
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className={errors.description ? 'error' : ''}
          />
          {errors.description && <span className="error-message">{errors.description}</span>}
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="date">Date and Time</label>
            <input
              type="datetime-local"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className={errors.date ? 'error' : ''}
            />
            {errors.date && <span className="error-message">{errors.date}</span>}
          </div>
          
          <div className="form-group">
            <label htmlFor="location">Location</label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className={errors.location ? 'error' : ''}
            />
            {errors.location && <span className="error-message">{errors.location}</span>}
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="price">Ticket Price ($)</label>
            <input
              type="number"
              id="price"
              name="price"
              min="0"
              step="0.01"
              value={formData.price}
              onChange={handleChange}
              className={errors.price ? 'error' : ''}
            />
            {errors.price && <span className="error-message">{errors.price}</span>}
          </div>
          
          <div className="form-group">
            <label htmlFor="totalTickets">Total Tickets</label>
            <input
              type="number"
              id="totalTickets"
              name="totalTickets"
              min="1"
              value={formData.totalTickets}
              onChange={handleChange}
              className={errors.totalTickets ? 'error' : ''}
            />
            {errors.totalTickets && <span className="error-message">{errors.totalTickets}</span>}
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className={errors.category ? 'error' : ''}
          >
            <option value="">Select a category</option>
            <option value="Concert">Concert</option>
            <option value="Conference">Conference</option>
            <option value="Festival">Festival</option>
            <option value="Sports">Sports</option>
            <option value="Workshop">Workshop</option>
            <option value="Other">Other</option>
          </select>
          {errors.category && <span className="error-message">{errors.category}</span>}
        </div>
        
        <div className="form-group">
          <label htmlFor="image">Image URL (Optional)</label>
          <input
            type="url"
            id="image"
            name="image"
            value={formData.image}
            onChange={handleChange}
          />
        </div>
        
        <div className="form-actions">
          <button type="submit" className="submit-button" disabled={submitting}>
            {submitting ? 'Saving...' : (isEditing ? 'Update Event' : 'Create Event')}
          </button>
          <button
            type="button"
            onClick={() => navigate('/my-events')}
            className="cancel-button"
            disabled={submitting}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EventForm;
