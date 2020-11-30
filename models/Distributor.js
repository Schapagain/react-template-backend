const allCountries = require('iso3166-2-db');
const { ValidationError } = require('../utils/errors');

const validateCircle = circle => {
    const { radius, center } = circle;

    if (!radius)
        throw new ValidationError('area','circle needs a radius property');
    if (!center)
        throw new ValidationError('area','circle needs a center property');

    const { lat, long } = center;

    if(!lat)
        throw new ValidationError('area','center needs a lat property');
    if (!long)
        throw new ValidationError('area','center needs a long property');

}

const validateRectangle = rectangle => {
    const { bounds } = rectangle;

    if (!bounds)
        throw new ValidationError('area','rectangle needs a bounds property');
    
    const requiredBounds = ['south','west','east','north'];
    requiredBounds.forEach(bound => {
        if (!bounds[bound])
            throw new ValidationError('area','bounds needs a '.concat(bound,' property'));
    })
}

const validatePolygon = polygon => {
    const { paths } = polygon;

    if (!paths)
        throw new ValidationError('area','polygon needs a paths property that holds an array of {lat,long}s');
    
    if (!Array.isArray(paths))
        throw new ValidationError('area','paths should be an array of {lat,long}s')

    paths.forEach(coordinate => {
        const { lat, long } = coordinate;
        if (!lat || !long)
            throw new ValidationError('area','each element of paths needs to have a lat and a long property')
    })

    if (paths.length < 3)
        throw new ValidationError('area','polygon needs at least three {lat,long} coordinates');

}

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
        area: {
            type: DataTypes.JSONB,
            validate: {
                isValidType(area){
                    const validTypes = new Set(["'none'","'circle'","'rectangle'","'polygon'"]);
                    const { type, options } = area;
                    if (type === 'none'){
                        this.area = {"type":"none"}
                        return;
                    }

                    if (!type || !options)
                        throw new ValidationError('area','area needs two properties: type and options')
                    switch(type){
                        case 'circle':
                            validateCircle(options);
                            break;
                        case 'rectangle':
                            validateRectangle(options);
                            break;
                        case 'polygon':
                            validatePolygon(options);
                            break;
                        default:
                            throw new ValidationError('area', 'type has to be either ' + [...validTypes].join(' or a '))
                        
                    }
                }
            }
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        country: {
            type: DataTypes.STRING, 
            allowNull: false,
            validate: {
                isValidCountry(name){
                    if (!allCountries.findCountryByName(name))
                        throw new ValidationError('country name','does not exist on Earth');
                },
            }
        },
        language: {
            type: DataTypes.STRING,
            allowNull: false,
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