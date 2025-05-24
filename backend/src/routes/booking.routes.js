const express = require('express');
const router = express.Router();
const Booking = require('../models/booking.model');
const Event = require('../models/event.model');
const { authMiddleware, authorizeRoles } = require('../middleware/auth.middleware');

// Get user's bookings
router.get('/my-bookings', authMiddleware, authorizeRoles('user', 'organizer', 'admin'), async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate({
        path: 'event',
        select: 'title date location price image'
      })
      .sort({ createdAt: -1 });
    
    res.status(200).json(bookings);
  } catch (error) {
    console.error('Get my bookings error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get booking by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate({
        path: 'event',
        select: 'title date location price image totalTickets availableTickets'
      });
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Check if the booking belongs to the user or the user is an admin
    if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view this booking' });
    }
    
    res.status(200).json(booking);
  } catch (error) {
    console.error('Get booking by ID error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create new booking
router.post('/', authMiddleware, authorizeRoles('user'), async (req, res) => {
  try {
    const { eventId, ticketCount } = req.body;
    
    // Validate ticket count
    if (!ticketCount || ticketCount < 1) {
      return res.status(400).json({ message: 'Please specify a valid ticket count' });
    }
    
    // Find the event and check if it exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Check if event is approved
    if (event.status !== 'approved') {
      return res.status(400).json({ message: 'Cannot book tickets for an unapproved event' });
    }
    
    // Check ticket availability
    if (event.availableTickets < ticketCount) {
      return res.status(400).json({ 
        message: `Not enough tickets available. Only ${event.availableTickets} tickets left.` 
      });
    }
    
    // Calculate total price
    const totalPrice = event.price * ticketCount;
    
    // Create the booking
    const booking = new Booking({
      user: req.user._id,
      event: eventId,
      ticketCount,
      totalPrice,
      status: 'confirmed'
    });
    
    // Update event available tickets
    const previousAvailableTickets = event.availableTickets;
    event.availableTickets -= ticketCount;
    
    // Save both documents
    await Promise.all([
      booking.save(),
      event.save()
    ]);
    
    res.status(201).json({
      message: 'Booking confirmed successfully',
      booking: {
        id: booking._id,
        event: {
          id: event._id,
          title: event.title,
          date: event.date,
          location: event.location
        },
        ticketCount,
        totalPrice,
        createdAt: booking.createdAt
      },
      ticketInfo: {
        previousAvailableTickets,
        currentAvailableTickets: event.availableTickets,
        totalTickets: event.totalTickets
      }
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Cancel booking
router.put('/:id/cancel', authMiddleware, authorizeRoles('user'), async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Check if the booking belongs to the user
    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to cancel this booking' });
    }
    
    // Check if the booking is already cancelled
    if (booking.status === 'cancelled') {
      return res.status(400).json({ message: 'Booking is already cancelled' });
    }
    
    // Update booking status
    booking.status = 'cancelled';
    
    // Update event available tickets
    const event = await Event.findById(booking.event);
    if (event) {
      event.availableTickets += booking.ticketCount;
      await event.save();
    }
    
    await booking.save();
    
    res.status(200).json({
      message: 'Booking cancelled successfully',
      booking
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete booking - Standard user
router.delete('/:id', authMiddleware, authorizeRoles('user'), async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Check if the booking belongs to the user
    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this booking' });
    }
    
    // Update event available tickets if booking was confirmed
    if (booking.status === 'confirmed') {
      const event = await Event.findById(booking.event);
      if (event) {
        event.availableTickets += booking.ticketCount;
        await event.save();
      }
    }
    
    await Booking.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      message: 'Booking deleted successfully'
    });
  } catch (error) {
    console.error('Delete booking error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all bookings - Admin only
router.get('/', authMiddleware, authorizeRoles('admin'), async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate({
        path: 'user',
        select: 'name email'
      })
      .populate({
        path: 'event',
        select: 'title date location'
      })
      .sort({ createdAt: -1 });
    
    res.status(200).json(bookings);
  } catch (error) {
    console.error('Get all bookings error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get bookings for an event - Organizer only
router.get('/event/:eventId', authMiddleware, authorizeRoles('organizer'), async (req, res) => {
  try {
    const eventId = req.params.eventId;
    
    // Check if event exists and belongs to the organizer
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    if (event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view bookings for this event' });
    }
    
    const bookings = await Booking.find({ event: eventId })
      .populate({
        path: 'user',
        select: 'name email'
      })
      .sort({ createdAt: -1 });
    
    res.status(200).json(bookings);
  } catch (error) {
    console.error('Get event bookings error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;