
const { allowedLanguages, allowedCountries } = require('../utils');
const { ValidationError } = require('../utils/errors');

module.exports = function(sequelize, DataTypes) {
    const Schema = {
        adminId: {
            type: DataTypes.STRING,
            field: 'admin_id',
        },
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        loginId:{
            type: DataTypes.INTEGER,
            foreignKey: true,
            field: 'login_id',
        },
        isSuperuser:{
            type: DataTypes.BOOLEAN,
            field: 'is_superuser'
        },
        usesPan: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            field: 'uses_pan',
            validate: {
                hasPanOrVat(usesPan){
                    if (usesPan && !this.pan || !usesPan && !this.vat)
                        throw new ValidationError('pan/vat',' Either pan or vat number is required');
                }
            }
        },
        pan: {
            type: DataTypes.INTEGER,
        },
        vat: {
            type: DataTypes.INTEGER,
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
        state: {
            type: DataTypes.STRING,
            allowNull: false
        },
        district: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        municipality: {
            type: DataTypes.STRING,
            allowNull: false
        },
        locality: {
            type: DataTypes.STRING,
        },
        ward: DataTypes.STRING,
        street: DataTypes.STRING,
        lat: {
            type: DataTypes.FLOAT,
        },
        long: {
            type: DataTypes.FLOAT
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
            field: 'updated_at'
        },
        createdAt: {
            type: DataTypes.DATE,
            field: 'created_at'
        },
        website: DataTypes.STRING,
    };

    const options = {
        paranoid: true,
        tableName: 'distributors'
    }

    const Distributor = sequelize.define('Distributor', Schema, options);
    Distributor.associate = models => {
        Distributor.hasMany(models.Distributor,{foreignKey: 'admin_id'});
        Distributor.hasMany(models.Driver,{foreignKey: 'distributor_id'});
        Distributor.hasMany(models.Vehicle,{foreignKey: 'distributor_id'});
        Distributor.hasMany(models.User,{foreignKey: 'distributor_id'});
        Distributor.hasOne(models.Login,{foreignKey: 'distributor_id'});
        Distributor.hasMany(models.Country,{foreignKey: 'distributor_id'});
    }

    return Distributor;
}