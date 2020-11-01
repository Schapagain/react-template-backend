const Sequelise = require('sequelize');
const db = require('../utils/db');

const Login = db.define('Login', {
    id: {
        type: Sequelise.STRING,
        allowNull: false,
        primaryKey: true,
    },
    email: {
        type: Sequelise.STRING,
        allowNull: false
    },
    password: {
        type: Sequelise.STRING,
    },
    role: {
        type: Sequelise.STRING,
        allowNull: false
    },
},{
    tableName: 'login',
    createdAt: 'createdat',
    updatedAt: 'updatedat'
}
)

module.exports = Login;