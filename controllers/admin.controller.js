const { User, Store, Rating } = require('../models');
const { Op } = require('sequelize');
const { sequelize } = require('../config/db');
const bcrypt = require('bcryptjs');

// Add New Store
const addStore = async (req, res) => {
  try {
    const { name, email, address, ownerId } = req.body;

    // Validation checks for friendly messages
    if (name && name.length < 20) {
      return res.status(400).json({ message: 'Enter Store Name (Minimum 20 Characters)' });
    }
    if (address && address.length > 400) {
      return res.status(400).json({ message: 'Address is too long (Maximum 400 characters)' });
    }

    let finalOwnerId = ownerId;

    // If ownerId looks like an email, find the user ID
    if (ownerId && ownerId.includes('@')) {
      const owner = await User.findOne({ where: { email: ownerId } });
      if (!owner) {
        return res.status(404).json({ message: 'Store owner not found with this email' });
      }
      finalOwnerId = owner.id;
    } else if (ownerId) {
      // Verify the UUID exists
      const owner = await User.findByPk(ownerId);
      if (!owner) {
        return res.status(404).json({ message: 'Store owner not found with this ID' });
      }
    }

    const store = await Store.create({
      name,
      email,
      address,
      ownerId: finalOwnerId || null
    });

    res.status(201).json(store);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message || 'Error adding store' });
  }
};

// Add New User (Admin, Normal, or Owner)
const addUser = async (req, res) => {
  try {
    const { name, email, password, address, role } = req.body;

    // Manual check for common length constraints to provide friendly messages
    if (name && name.length < 20) {
      return res.status(400).json({ message: 'Enter Full Name (Minimum 20 Characters)' });
    }
    if (password && password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = await User.create({ name, email, password: hashedPassword, address, role });
    res.status(201).json(user);
  } catch (error) {
    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
      const messages = error.errors.map(err => {
        if (err.path === 'name' && err.validatorKey === 'len') return 'Name must be 20 to 60 characters';
        if (err.path === 'email' && err.validatorKey === 'isEmail') return 'Invalid email address';
        return err.message;
      });
      return res.status(400).json({ message: messages[0] });
    }
    console.error(error);
    res.status(400).json({ message: 'Error adding user' });
  }
};

// Get Dashboard Stats
const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.count();
    const totalStores = await Store.count();
    const totalRatings = await Rating.count();
    res.json({ totalUsers, totalStores, totalRatings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// List Stores with Ratings
const getStores = async (req, res) => {
  try {
    const { search, sortBy, order } = req.query;
    let whereClause = {};

    if (search) {
      whereClause = {
        [Op.or]: [
          { name: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } },
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
        }
      ],
      attributes: [
        'id', 'name', 'email', 'address',
        [sequelize.fn('AVG', sequelize.col('ratings.rating')), 'averageRating']
      ],
      group: ['Store.id'],
      order: sortBy ? [[sortBy, order || 'ASC']] : [['name', 'ASC']],
    });

    res.json(stores);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// List Users (Admin and Normal)
const getUsers = async (req, res) => {
  try {
    const { search, sortBy, order, role } = req.query;
    let whereClause = {};

    if (role) whereClause.role = role;
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { address: { [Op.like]: `%${search}%` } },
      ];
    }

    const users = await User.findAll({
      where: whereClause,
      order: sortBy ? [[sortBy, order || 'ASC']] : [['name', 'ASC']],
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Store,
          as: 'managedStore',
          include: [
            {
              model: Rating,
              as: 'ratings',
              attributes: [],
            }
          ],
          attributes: [
            [sequelize.fn('AVG', sequelize.col('managedStore.ratings.rating')), 'averageRating']
          ]
        }
      ],
      group: ['User.id', 'managedStore.id'] // Grouping needed for aggregate
    });

    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { addStore, addUser, getDashboardStats, getStores, getUsers };
