const { Sequelize } = require('sequelize');
const Sequelize = require('sequelize');
const db = require('../utils/db');

const Schema = {
    id: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true,
    },
    email: Sequelize.STRING,
    phone: Sequelize.STRING,
    password: {
        type: Sequelize.STRING,
    },
    role: {
        type: Sequelize.STRING,
        allowNull: false
    },
    createdAt: {
        type: Sequelize.DATE,
        field: 'created_at'
    },
    updatedAt: {
        type: Sequelize.DATE,
        field: 'updated_at'
    },
    deletedAt: {
        type: Sequelize.DATE,
        field: 'deleted_at'
    }
}

const options = {
    tableName: 'login',
    paranoid: true,
}

const Login = db.define('Login', Schema, options)

module.exports = Login;