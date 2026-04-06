const { User, Store, Rating } = require('../models');
const { sequelize } = require('../config/db');

// Get owner store dashboard
const getOwnerDashboard = async (req, res) => {
  try {
    const ownerId = req.user.id;

    // Find the store owned by this user
    const store = await Store.findOne({
      where: { ownerId },
      include: [
        {
          model: Rating,
          as: 'ratings',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['name', 'email', 'address']
            }
          ]
        }
      ],
      order: [[{ model: Rating, as: 'ratings' }, 'createdAt', 'DESC']]
    });

    if (!store) {
      return res.status(404).json({ message: 'Store not found for this owner' });
    }

    // Convert to JSON to add the calculated field
    const storeJson = store.toJSON();
    
    // Calculate average rating
    if (storeJson.ratings && storeJson.ratings.length > 0) {
      const sum = storeJson.ratings.reduce((acc, r) => acc + r.rating, 0);
      storeJson.averageRating = sum / storeJson.ratings.length;
    } else {
      storeJson.averageRating = 0;
    }

    res.json(storeJson);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getOwnerDashboard };
