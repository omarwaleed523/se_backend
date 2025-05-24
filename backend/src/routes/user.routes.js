const express = require('express');
const router = express.Router();
const User = require('../models/user.model');
const Booking = require('../models/booking.model');
const Event = require('../models/event.model');
const { authMiddleware, authorizeRoles } = require('../middleware/auth.middleware');

// Get all users - Admin only
router.get('/', authMiddleware, authorizeRoles('admin'), async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user profile - Authenticated users
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update user profile - Authenticated users
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { name, email, phone, address, profilePicture } = req.body;
    
    // Find user and update
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, email, phone, address, profilePicture },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json({
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user's bookings - Standard user access
router.get('/bookings', authMiddleware, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('event', 'title date location price')
      .sort({ createdAt: -1 });
      
    res.status(200).json(bookings);
  } catch (error) {
    console.error('Get user bookings error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user's events - Organizer only
router.get('/events', authMiddleware, authorizeRoles('organizer'), async (req, res) => {
  try {
    const events = await Event.find({ organizer: req.user._id })
      .sort({ createdAt: -1 });
    
    res.status(200).json(events);
  } catch (error) {
    console.error('Get user events error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get event analytics for current user - Organizer only
router.get('/events/analytics', authMiddleware, authorizeRoles('organizer'), async (req, res) => {
  try {
    const events = await Event.find({ organizer: req.user._id });
    const eventsWithAnalytics = [];
    
    for (const event of events) {
      const totalBookings = await Booking.countDocuments({ 
        event: event._id,
        status: 'confirmed'
      });
      
      const bookedTickets = event.totalTickets - event.availableTickets;
      const percentageBooked = (bookedTickets / event.totalTickets) * 100;
      
      eventsWithAnalytics.push({
        id: event._id,
        title: event.title,
        totalTickets: event.totalTickets,
        bookedTickets,
        availableTickets: event.availableTickets,
        percentageBooked,
        totalBookings
      });
    }
    
    res.status(200).json(eventsWithAnalytics);
  } catch (error) {
    console.error('Get events analytics error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user by ID - Admin only
router.get('/:id', authMiddleware, authorizeRoles('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update user role - Admin only
router.put('/:id/role', authMiddleware, authorizeRoles('admin'), async (req, res) => {
  try {
    const { role } = req.body;
    
    // Validate role
    if (!['user', 'organizer', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json({
      message: 'User role updated successfully',
      user
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete user - Admin only
router.delete('/:id', authMiddleware, authorizeRoles('admin'), async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json({
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;