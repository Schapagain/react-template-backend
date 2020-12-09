
module.exports = function(sequelize, DataTypes) {
    const VehicleModel = sequelize.define('VehicleModel', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            uinque: true,
        },
        year: {
            type: DataTypes.INTEGER,
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
        tableName: 'vehicle_models',
    }
    )
    VehicleModel.associate = models => {
        VehicleModel.belongsTo(models.VehicleBrand,{foreignKey: 'brand_id'});
    }
    return VehicleModel;
}
