


module.exports = function(sequelize, DataTypes) {
    const Locality = sequelize.define('Locality', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        countryId: {
            type: DataTypes.INTEGER,
            foreignKey: true,
            field: 'country_id'
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
        tableName: 'localities',
    }
    )

    Locality.associate = models => {
        Locality.belongsTo(models.Country,{foreignKey: 'country_id'});
        Locality.belongsTo(models.State,{foreignKey: 'state_id'});
        Locality.belongsTo(models.District,{foreignKey: 'district_id'});
        Locality.belongsTo(models.Municipality,{foreignKey: 'municipality_id'});
        Locality.hasMany(models.Ward,{foreignKey: 'locality_id'});
    }

    return Locality;
}
