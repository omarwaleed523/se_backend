import { useState, useEffect } from 'react';
import { eventService } from '../../services/api';
import Loader from '../shared/Loader';
import EventCard from './EventCard';
import './EventStyles.css';
import { toast } from 'react-toastify';

const EventList = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await eventService.getAllEvents();
        const eventData = response.data;
        setEvents(eventData);
        
        // Extract unique categories
        const uniqueCategories = [...new Set(eventData.map(event => event.category))];
        setCategories(uniqueCategories);
      } catch (error) {
        console.error('Error fetching events:', error);
        toast.error('Failed to load events');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleCategoryChange = (e) => {
    setCategoryFilter(e.target.value);
  };

  const filteredEvents = events
    .filter(event => event.status === 'approved')
    .filter(event => {
      return (
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    })
    .filter(event => {
      if (!categoryFilter) return true;
      return event.category === categoryFilter;
    });

  if (loading) return <Loader />;

  return (
    <div className="event-list-container">
      <h1>Upcoming Events</h1>
      
      <div className="filters">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search events..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        
        <div className="category-filter">
          <select value={categoryFilter} onChange={handleCategoryChange}>
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {filteredEvents.length === 0 ? (
        <div className="no-events">
          <p>No events found. Try adjusting your filters.</p>
        </div>
      ) : (
        <div className="event-grid">
          {filteredEvents.map(event => (
            <EventCard key={event._id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
};

export default EventList;
