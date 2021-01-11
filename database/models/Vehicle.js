const { NotUniqueError, NotFoundError } = require('../utils/errors'); 

module.exports = function(sequelize, DataTypes){
    const Vehicle = sequelize.define('Vehicle', {
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
        driverId: {
            type: DataTypes.STRING,
            field: 'driver_id',
            foreignKey: true,
            validate: {
                    async driverExists(id){
                        const driver = await sequelize.models.Driver.findOne({where: {distributorId: this.distributorId, id}})
                        if (!driver)
                            throw new NotFoundError('driver')
                }
            }
        },
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        registrationDocument: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'registration_document'
        },
        modelId: {
            type: DataTypes.STRING,
            field: 'model_id',
            foreignKey: true,
        },
        modelYear:{
            type: DataTypes.INTEGER,
            field: 'model_year',
        },
        licensePlate: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'license_plate',
            validate: {
                async isUnique(licensePlate){
                    const vehicle = await Vehicle.findOne({where:{distributorId: this.distributorId,licensePlate}});
                    if (vehicle)
                        throw new NotUniqueError('license plate'); 
                }
            }
        },
        chassisNumber: {
            type: DataTypes.STRING,
            field: 'chassis_number',
        },
        seats: DataTypes.INTEGER,
        doors: DataTypes.INTEGER,
        color: DataTypes.STRING,
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
        tableName: 'vehicles',
        paranoid: true,
    }
    )

    Vehicle.associate = models => {
        Vehicle.belongsTo(models.Distributor,{foreignKey: 'distributor_id'});
        Vehicle.belongsTo(models.Driver, {foreignKey: 'driver_id'});
        Vehicle.belongsTo(models.VehicleModel, {foreignKey: 'model_id'});
    }

    return Vehicle;
}