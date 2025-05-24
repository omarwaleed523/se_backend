import { useState, useEffect } from 'react';
import { eventService } from '../../services/api';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import Loader from '../shared/Loader';
import { toast } from 'react-toastify';
import './EventStyles.css';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const EventAnalytics = () => {
  const [events, setEvents] = useState([]);
  const [analytics, setAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState('');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await eventService.getMyEvents();
        setEvents(response.data);
        
        if (response.data.length > 0) {
          setSelectedEvent(response.data[0]._id);
        }
      } catch (error) {
        console.error('Error fetching events:', error);
        toast.error('Failed to load your events');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  useEffect(() => {
    if (selectedEvent) {
      fetchEventAnalytics(selectedEvent);
    }
  }, [selectedEvent]);

  const fetchEventAnalytics = async (eventId) => {
    try {
      setLoading(true);
      const response = await eventService.getEventAnalytics(eventId);
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load event analytics');
    } finally {
      setLoading(false);
    }
  };

  const handleEventChange = (e) => {
    setSelectedEvent(e.target.value);
  };

  // Prepare data for the pie chart
  const pieChartData = {
    labels: ['Booked Tickets', 'Available Tickets'],
    datasets: [
      {
        data: [
          analytics.bookedTickets || 0,
          analytics.availableTickets || 0
        ],
        backgroundColor: ['#f39c12', '#3498db'],
        borderColor: ['#f39c12', '#3498db'],
        borderWidth: 1,
      },
    ],
  };

  // Get all events' booking percentages for bar chart
  const barChartData = {
    labels: events.map(event => event.title),
    datasets: [
      {
        label: 'Booking Percentage',
        data: events.map(event => {
          const booked = event.totalTickets - event.availableTickets;
          return ((booked / event.totalTickets) * 100).toFixed(2);
        }),
        backgroundColor: '#3498db',
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Ticket Booking Percentage Across All Events',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: 'Percentage (%)',
        },
      },
    },
  };

  if (loading && events.length === 0) return <Loader />;

  return (
    <div className="analytics-container">
      <h1>Event Analytics</h1>

      {events.length === 0 ? (
        <div className="no-data">
          <p>You don't have any events to analyze.</p>
        </div>
      ) : (
        <>
          <div className="analytics-selection">
            <label htmlFor="event-select">Select Event:</label>
            <select
              id="event-select"
              value={selectedEvent}
              onChange={handleEventChange}
            >
              {events.map(event => (
                <option key={event._id} value={event._id}>
                  {event.title}
                </option>
              ))}
            </select>
          </div>

          {loading ? (
            <Loader />
          ) : (
            <div className="analytics-content">
              <div className="analytics-card">
                <h2>Ticket Sales Overview</h2>
                <div className="stats-grid">
                  <div className="stat-item">
                    <span className="stat-label">Total Tickets</span>
                    <span className="stat-value">{analytics.totalTickets || 0}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Tickets Booked</span>
                    <span className="stat-value">{analytics.bookedTickets || 0}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Tickets Available</span>
                    <span className="stat-value">{analytics.availableTickets || 0}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Booking Percentage</span>
                    <span className="stat-value">{analytics.percentageBooked?.toFixed(2) || 0}%</span>
                  </div>
                </div>
              </div>

              <div className="chart-container">
                <div className="chart-card">
                  <h3>Ticket Distribution</h3>
                  <div className="chart">
                    <Pie data={pieChartData} />
                  </div>
                </div>
              </div>

              <div className="chart-card full-width">
                <h3>Comparison Across Events</h3>
                <div className="chart">
                  <Bar data={barChartData} options={barChartOptions} />
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default EventAnalytics;
