


module.exports = function(sequelize, DataTypes) {
    const Ward = sequelize.define('Ward', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        countryId: {
            type: DataTypes.INTEGER,
            foreignKey: true,
            field:'country_id'
        },
        stateId: {
            type: DataTypes.INTEGER,
            foreignKey: true,
            field: 'state_id'
        },
        districtId: {
            type: DataTypes.INTEGER,
            foreignKey: true,
            field: 'district_id'
        },
        municipalityId: {
            type: DataTypes.INTEGER,
            foreignKey: true,
            field: 'municipality_id'
        },
        locality_id: {
            type: DataTypes.INTEGER,
            foreignKey: true,
            field: 'locality_id'
        },
        number: {
            type: DataTypes.INTEGER,
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
        tableName: 'wards',
    }
    )

    Ward.associate = models => {
        Ward.belongsTo(models.Country,{foreignKey: 'country_id'});
        Ward.belongsTo(models.State,{foreignKey: 'state_id'});
        Ward.belongsTo(models.District,{foreignKey: 'district_id'});
        Ward.belongsTo(models.Municipality,{foreignKey: 'municipality_id'});
        Ward.belongsTo(models.Locality,{foreignKey: 'locality_id'});
    }

    return Ward;
}
