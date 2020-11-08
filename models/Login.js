const { Sequelize } = require('sequelize');
const Sequelise = require('sequelize');
const db = require('../utils/db');

const Schema = {
    id: {
        type: Sequelise.STRING,
        allowNull: false,
        primaryKey: true,
    },
    email: Sequelise.STRING,
    phone: Sequelise.STRING,
    password: {
        type: Sequelise.STRING,
    },
    role: {
        type: Sequelise.STRING,
        allowNull: false
    },
    createdAt: {
        type: Sequelize.DATE,
        field: 'created_at'
    },
    updatedAt: {
        type: Sequelize.DATE,
        field: 'updated_at'
    }
}

const options = {
    tableName: 'login',
    paranoid: true,
    deletedAt: 'deleted_at'
}

const Login = db.define('Login', Schema, options)

module.exports = Login;