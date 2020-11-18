
const Sequelize = require('sequelize');
const { allowedLanguages, allowedCountries } = require('../utils');
const db = require('../utils/db');

const Schema = {
    adminId: {
        type: Sequelize.STRING,
        allowNull: false,
        field: 'admin_id',
        foreignKey: true,
    },
    id: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true,
    },
    usesPan: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        field: 'uses_pan_or_vat'
    },
    panOrVat: {
        type: Sequelize.INTEGER,
        allowNull: false,
        field: 'pan_or_vat'
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    country: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            isIn: [allowedCountries]
        }
    },
    language: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            isIn: [allowedLanguages]
        }
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        validate:{
            isEmail: true,
        }
    },
    phone: {
        type: Sequelize.STRING,
        allowNull: false
    },
    street: {
        type: Sequelize.STRING,
        allowNull: false
    },
    state: {
        type: Sequelize.STRING,
        allowNull: false
    },
    postal: {
        type: Sequelize.STRING,
        allowNull: false
    },
    licenseDocument: {
        type: Sequelize.STRING,
        allowNull: false,
        field: 'license_document'
    },
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
        field: 'created_at'
    },
    district: Sequelize.STRING,
    municipality: Sequelize.STRING,
    ward: Sequelize.STRING,
    website: Sequelize.STRING,
};

const options = {
    paranoid: true,
}

const Distributor = db.define('distributor', Schema, options);

module.exports = Distributor;