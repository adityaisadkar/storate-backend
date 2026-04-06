const User = require('./User');
const Store = require('./Store');
const Rating = require('./Rating');

// Relationships
User.hasMany(Rating, { foreignKey: 'userId', as: 'ratings' });
Rating.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Store.hasMany(Rating, { foreignKey: 'storeId', as: 'ratings' });
Rating.belongsTo(Store, { foreignKey: 'storeId', as: 'store' });

User.hasOne(Store, { foreignKey: 'ownerId', as: 'managedStore' });
Store.belongsTo(User, { foreignKey: 'ownerId', as: 'owner' });

module.exports = {
  User,
  Store,
  Rating,
};
