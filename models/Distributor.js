const { Sequelize } = require('sequelize');
const Sequelise = require('sequelize');
const { allowedLanguages, allowedCountries } = require('../utils');
const db = require('../utils/db');

const Schema = {
    adminId: {
        type: Sequelise.STRING,
        allowNull: false,
        field: 'admin_id',
        foreignKey: true,
    },
    id: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true,
    },
    name: {
        type: Sequelise.STRING,
        allowNull: false
    },
    country: {
        type: Sequelise.STRING,
        allowNull: false,
        validate: {
            isIn: [allowedCountries]
        }
    },
    language: {
        type: Sequelise.STRING,
        allowNull: false,
        validate: {
            isIn: [allowedLanguages]
        }
    },
    email: {
        type: Sequelise.STRING,
        allowNull: false,
        unique: true,
        validate:{
            isEmail: true,
        }
    },
    phone: {
        type: Sequelise.STRING,
        allowNull: false
    },
    street: {
        type: Sequelise.STRING,
        allowNull: false
    },
    state: {
        type: Sequelise.STRING,
        allowNull: false
    },
    postal: {
        type: Sequelise.STRING,
        allowNull: false
    },
    licenseDocument: {
        type: Sequelise.STRING,
        allowNull: false,
        field: 'license_document'
    },
    profilePicture: {
        type: Sequelise.STRING,
        field: 'profile_picture',
    },
    district: Sequelise.STRING,
    municipality: Sequelise.STRING,
    ward: Sequelise.STRING,
    website: Sequelise.STRING,
};

const options = {
    paranoid: true,
    deletedAt: 'deleted_at',
    updatedAt: 'updated_at',
    createdAt: 'created_at',
}

const Distributor = db.define('distributor', Schema, options);

module.exports = Distributor;