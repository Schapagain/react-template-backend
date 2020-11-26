

module.exports = function(sequelize, DataTypes) {
    const Country = sequelize.define('Country', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
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
        tableName: 'countries',
    }
    )
    Country.associate = models => {
        Country.hasMany(models.State,{foreignKey: 'country_id'});
    }
    return Country;
}
