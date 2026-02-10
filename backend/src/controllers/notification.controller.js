import { Notification } from '../models/index.js';

// Get notifications
export const getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const total = await Notification.countDocuments({ user_id: req.user.id });

    const notifications = await Notification.find({ user_id: req.user.id })
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    res.json({
      notifications: notifications.map(n => ({ ...n, id: n._id })),
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Get unread count
export const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({ user_id: req.user.id, is_read: false });

    res.json({ count });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Mark as read
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    await Notification.findOneAndUpdate(
      { _id: id, user_id: req.user.id },
      { is_read: true }
    );

    res.json({ message: 'Notification marquée comme lue' });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Mark all as read
export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user_id: req.user.id },
      { is_read: true }
    );

    res.json({ message: 'Toutes les notifications marquées comme lues' });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Delete notification
export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    await Notification.findOneAndDelete({ _id: id, user_id: req.user.id });

    res.json({ message: 'Notification supprimée' });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};
