

module.exports = function(sequelize, DataTypes) {
    const Municipality = sequelize.define('Municipality', {
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
            field:'state_id'
        },
        districtId: {
            type: DataTypes.INTEGER,
            foreignKey: true,
            field:'district_id'
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
        tableName: 'municipalities',
    }
    )

    Municipality.associate = models => {
        Municipality.belongsTo(models.State,{foreignKey: 'state_id'});
        Municipality.belongsTo(models.Country,{foreignKey: 'country_id'});
        Municipality.belongsTo(models.Municipality,{foreignKey: 'district_id'});
        Municipality.hasMany(models.Locality,{foreignKey: 'municipality_id'});
        Municipality.hasMany(models.Ward,{foreignKey: 'municipality_id'});
    }

    return Municipality;
}
