
module.exports = function(sequelize, DataTypes){
    const Vehicle = sequelize.define('Vehicle', {
        distributorId: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'distributor_id',
            foreignKey: true,
        },
        driverId: {
            type: DataTypes.STRING,
            field: 'driver_id',
            foreignKey: true,
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
        model: {
            type: DataTypes.STRING,
            allowNull: false
        },
        licensePlate: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'license_plate',
        },
        modelYear: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'model_year',
        },
        company: {
            type: DataTypes.STRING,
            allowNull: false,
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
    }

    return Vehicle;
}