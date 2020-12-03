

module.exports = function(sequelize, DataTypes) {
    const District = sequelize.define('District', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        countryId: {
            type: DataTypes.INTEGER,
            foreignKey: true,
            allowNull: false,
            field:'country_id'
        },
        stateId: {
            type: DataTypes.INTEGER,
            foreignKey: true,
            field:'state_id'
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
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
        tableName: 'districts',
    }
    )

    District.associate = models => {
        District.belongsTo(models.State,{foreignKey: 'state_id'});
        District.belongsTo(models.Country,{foreignKey: 'country_id'});
        District.hasMany(models.Municipality,{foreignKey: 'district_id'});
        District.hasMany(models.Locality,{foreignKey: 'district_id'});
        District.hasMany(models.Ward,{foreignKey: 'district_id'});
    }

    return District;
}
