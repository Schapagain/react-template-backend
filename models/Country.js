const allCountries = require('iso3166-2-db');
const { ValidationError, NotUniqueError } = require('../utils/errors');

module.exports = function(sequelize, DataTypes) {
    const Country = sequelize.define('Country', {
        distributorId: {
            type: DataTypes.INTEGER,
            field: 'distributor_id',
            validate: {
                isNotSuperuser(id){
                    if (Number(id) <= 1)
                        throw new ValidationError('distributorId','must be greater than 1');
                }
            }
        },
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                isValidCountry(name){
                    if (!allCountries.findCountryByName(name))
                        throw new ValidationError('country name','does not exist on Earth');
                },
                async isUniqueCountry(name){
                    const country = await Country.findOne({where:{distributorId: this.distributorId,name}});
                    if (country){
                        console.log(country)
                        throw new NotUniqueError('country with that name');
                    }
                }
            }
        },
        createdAt: {
            type: DataTypes.DATE,
            field: 'created_at'
        },
        updatedAt: {
            type: DataTypes.DATE,
            field: 'updated_at'
        },
        deletedAt: {
            type: DataTypes.DATE,
            field: 'deleted_at'
        }
    },{
        tableName: 'countries',
    }
    )
    Country.associate = models => {
        Country.hasMany(models.State,{foreignKey: 'country_id'});
    }
    return Country;
}
