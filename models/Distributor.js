

const { allowedLanguages, allowedCountries } = require('../utils');

module.exports = function(sequelize, DataTypes) {
    const Schema = {
        adminId: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'admin_id',
        },
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        usesPan: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            field: 'uses_pan_or_vat'
        },
        panOrVat: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'pan_or_vat'
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        country: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                isIn: [allowedCountries]
            }
        },
        language: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                isIn: [allowedLanguages]
            }
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate:{
                isEmail: true,
            }
        },
        phone: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        street: {
            type: DataTypes.STRING,
            allowNull: false
        },
        state: {
            type: DataTypes.STRING,
            allowNull: false
        },
        postal: {
            type: DataTypes.STRING,
            allowNull: false
        },
        licenseDocument: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'license_document'
        },
        profilePicture: {
            type: DataTypes.STRING,
            field: 'profile_picture',
        },
        deletedAt: {
            type: DataTypes.DATE,
            field: 'deleted_at'
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            field: 'updated_at'
        },
        createdAt: {
            type: DataTypes.DATE,
            field: 'created_at'
        },
        district: DataTypes.STRING,
        municipality: DataTypes.STRING,
        ward: DataTypes.STRING,
        website: DataTypes.STRING,
    };

    const options = {
        paranoid: true,
        tableName: 'distributors',
        classMethods:{
            associate({ Driver, Vechicle }) {
                Distributor.hasMany(Driver,{as: 'Drivers'});
                Distributor.hasMany(Vechicle,{ as: 'Vehicles'});
            }
        }
    }

    const Distributor = sequelize.define('distributor', Schema, options);
    return Distributor;
}