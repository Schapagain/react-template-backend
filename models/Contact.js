const { Sequelize } = require('sequelize');
const Sequelise = require('sequelize');
const db = require('../utils/db');

const Contact = db.define('Contact', {
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
    jobPosition: {
        type: Sequelise.STRING,
        field: 'job_position',
    },
    title: Sequelise.STRING,
    email: Sequelise.STRING,
    phone: Sequelise.STRING,
    mobile: Sequelise.STRING,
    createdAt: {
        type: Sequelize.DATE,
        field: 'created_at'
    },
    updatedAt: {
        type: Sequelize.DATE,
        field: 'updated_at'
    }
},{
    tableName: 'contacts',
    paranoid:true,
    deletedAt:'deleted_at',
}
)

module.exports = Contact;