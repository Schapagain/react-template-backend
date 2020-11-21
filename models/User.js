
const Sequelize = require('sequelize');
const db = require('../utils/db');

const User = db.define('User', {
    distributorId: {
        type: Sequelize.STRING,
        allowNull: false,
        field: 'distributor_id',
        foreignKey: true,
    },
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    phone: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
    },
    email: {
        type: Sequelize.STRING,
        unique: true,
        validate:{
            isEmail: true,
        }
    },
    referral: Sequelize.STRING,
    profilePicture: {
        type: Sequelize.STRING,
        field: 'profile_picture',
    },
    deletedAt: {
        type: Sequelize.DATE,
        field: 'deleted_at'
    },
    updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        field: 'updated_at'
    },
    createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        field: 'created_at'
    },
},{
    tableName: 'users',
}
)

module.exports = User;