const { NotUniqueError, ValidationError} = require('../utils/errors');

module.exports = function( sequelize, DataTypes){
    const Driver = sequelize.define('Driver', {
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
        loginId: {
            type: DataTypes.INTEGER,
            field: 'login_id'
        },
        licenseDocument: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'license_document'
        },
        phone: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                async isUnique(phone){
                    const driver = await Driver.findOne({where:{distributorId: this.distributorId,phone,deletedAt:null}});
                    if (driver)
                        throw new NotUniqueError('phone'); 
                }
            }
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        dob: DataTypes.DATE,
        address : DataTypes.STRING,
        profilePicture: {
            type: DataTypes.STRING,
            field: 'profile_picture',
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
        paranoid: true,
        tableName: 'drivers'
    }
    )

    Driver.associate = models => {
        Driver.belongsTo(models.Distributor,{foreignKey: 'distributor_id'});
        Driver.hasOne(models.Vehicle,{foreignKey: 'driver_id'});
        Driver.hasOne(models.Login, {foreignKey: 'driver_id'});
    }

    return Driver;
}