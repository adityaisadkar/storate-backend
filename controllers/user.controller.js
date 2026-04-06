const { User, Store, Rating } = require('../models');
const { Op } = require('sequelize');
const { sequelize } = require('../config/db');

// List Stores for Normal User
const getStoresForUser = async (req, res) => {
  try {
    const { search, sortBy, order } = req.query;
    const userId = req.user.id;

    let whereClause = {};
    if (search) {
      whereClause = {
        [Op.or]: [
          { name: { [Op.like]: `%${search}%` } },
          { address: { [Op.like]: `%${search}%` } },
        ],
      };
    }

    const stores = await Store.findAll({
      where: whereClause,
      include: [
        {
          model: Rating,
          as: 'ratings',
          attributes: [],
        },
        {
          model: Rating,
          as: 'ratings',
          where: { userId },
          required: false,
          attributes: ['id', 'rating'] // User's submitted rating
        }
      ],
      attributes: [
        'id', 'name', 'address',
        [sequelize.fn('AVG', sequelize.col('ratings.rating')), 'overallRating']
      ],
      group: ['Store.id', 'ratings.id'],
      order: sortBy ? [[sortBy, order || 'ASC']] : [['name', 'ASC']],
    });

    res.json(stores);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Submit/Modify Rating
const submitRating = async (req, res) => {
  const { storeId, rating } = req.body;
  const userId = req.user.id;

  if (rating < 1 || rating > 5) {
    return res.status(400).json({ message: 'Rating must be between 1 and 5' });
  }

  try {
    const [ratingObj, created] = await Rating.findOrCreate({
      where: { userId, storeId },
      defaults: { rating }
    });

    if (!created) {
      ratingObj.rating = rating;
      await ratingObj.save();
    }

    res.status(200).json({ message: 'Rating submitted successfully', rating: ratingObj });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getStoresForUser, submitRating };
