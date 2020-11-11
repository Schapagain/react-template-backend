const { Sequelize } = require('sequelize');
const Sequelise = require('sequelize');
const db = require('../utils/db');

const User = db.define('User', {
    distributorId: {
        type: Sequelise.STRING,
        allowNull: false,
        field: 'distributor_id',
        foreignKey: true,
    },
    id: {
        type: Sequelise.STRING,
        allowNull: false,
        primaryKey: true,
    },
    name: {
        type: Sequelise.STRING,
        allowNull: false,
    },
    phone: {
        type: Sequelise.STRING,
        allowNull: false,
        unique: true,
    },
    email: Sequelise.STRING,
    password: {
        type: Sequelise.STRING,
        allowNull: false
    },
    profilePicture: {
        type: Sequelise.STRING,
        field: 'profile_picture',
    }
},{
    tableName: 'users',
    deletedAt: 'deleted_at',
    updatedAt: 'updated_at',
    createdAt: 'created_at',
}
)

module.exports = User;