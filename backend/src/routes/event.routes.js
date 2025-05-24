const express = require('express');
const router = express.Router();
const Event = require('../models/event.model');
const Booking = require('../models/booking.model');
const { authMiddleware, authorizeRoles } = require('../middleware/auth.middleware');

// Get all events - Public access
router.get('/', async (req, res) => {
  try {
    // For testing purposes, let's get all events regardless of status
    const events = await Event.find()
      .populate('organizer', 'name email')
      .sort({ date: 1 });
    
    res.status(200).json(events);
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get organizer's events - Organizer only
router.get('/my-events', authMiddleware, authorizeRoles('organizer'), async (req, res) => {
  try {
    console.log('User object:', req.user);
    console.log('User ID for query:', req.user._id);
    
    const events = await Event.find({ organizer: req.user._id })
      .sort({ createdAt: -1 });
    
    console.log('Found events:', events.length);
    res.status(200).json(events);
  } catch (error) {
    console.error('Get organizer events error:', error);
    console.error('Error details:', error.stack);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all pending events - Admin only
router.get('/admin/pending', authMiddleware, authorizeRoles('admin'), async (req, res) => {
  try {
    const events = await Event.find({ status: 'pending' })
      .populate('organizer', 'name email')
      .sort({ createdAt: -1 });
    
    res.status(200).json(events);
  } catch (error) {
    console.error('Get pending events error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get event by ID - Public access
router.get('/:id', async (req, res) => {
  try {
    // For testing purposes, get event regardless of status
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'name email');
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    res.status(200).json(event);
  } catch (error) {
    console.error('Get event by ID error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create new event - Organizers only
router.post('/', authMiddleware, authorizeRoles('organizer'), async (req, res) => {
  try {
    const { 
      title, description, date, location, price, totalTickets, 
      category, image
    } = req.body;
    
    const event = new Event({
      title,
      description,
      date,
      location,
      price,
      totalTickets,
      availableTickets: totalTickets, // Initially, all tickets are available
      category,
      image,
      organizer: req.user._id,
      status: 'pending' // Default status is pending, admin must approve
    });
    
    await event.save();
    
    res.status(201).json({
      message: 'Event created successfully and pending admin approval',
      event
    });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update event - Organizers only
router.put('/:id', authMiddleware, authorizeRoles('organizer'), async (req, res) => {
  try {
    const { date, location, totalTickets } = req.body;
    
    // Get the existing event
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Verify that the event belongs to the organizer
    if (event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this event' });
    }
    
    // Calculate the difference in tickets
    const ticketDifference = totalTickets - event.totalTickets;
    
    // Update the event
    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      {
        date,
        location,
        totalTickets,
        availableTickets: event.availableTickets + ticketDifference, // Adjust available tickets
        status: 'pending' // Reset to pending after edit (requires admin approval)
      },
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      message: 'Event updated successfully and pending admin approval',
      event: updatedEvent
    });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete event - Organizers only
router.delete('/:id', authMiddleware, authorizeRoles('organizer'), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Verify that the event belongs to the organizer
    if (event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this event' });
    }
    
    // Check for existing bookings
    const bookings = await Booking.find({ event: req.params.id, status: 'confirmed' });
    if (bookings.length > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete event with existing bookings' 
      });
    }
    
    await Event.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      message: 'Event deleted successfully'
    });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get event analytics - Organizer only
router.get('/:id/analytics', authMiddleware, authorizeRoles('organizer'), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Verify that the event belongs to the organizer
    if (event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view analytics for this event' });
    }
    
    // Get the booking data
    const totalBookings = await Booking.countDocuments({ 
      event: req.params.id,
      status: 'confirmed'
    });
    
    const bookedTickets = event.totalTickets - event.availableTickets;
    const percentageBooked = (bookedTickets / event.totalTickets) * 100;
    
    res.status(200).json({
      event: {
        id: event._id,
        title: event.title
      },
      totalTickets: event.totalTickets,
      bookedTickets,
      availableTickets: event.availableTickets,
      percentageBooked,
      totalBookings
    });
  } catch (error) {
    console.error('Get event analytics error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Approve or reject event - Admin only
router.put('/:id/status', authMiddleware, authorizeRoles('admin'), async (req, res) => {
  try {
    const { status } = req.body;
    
    // Validate status
    if (!['approved', 'pending', 'declined'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }
    
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    res.status(200).json({
      message: `Event ${status} successfully`,
      event
    });  } catch (error) {
    console.error('Update event status error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;