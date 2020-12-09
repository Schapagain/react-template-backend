
module.exports = function(sequelize, DataTypes) {
    const VehicleBrand = sequelize.define('VehicleBrand', {
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
        tableName: 'vehicle_brands',
    }
    )
    VehicleBrand.associate = models => {
        VehicleBrand.hasMany(models.VehicleModel,{foreignKey: 'brand_id'});
    }
    return VehicleBrand;
}
