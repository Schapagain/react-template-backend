

module.exports = function(sequelize, DataTypes) {
    const State = sequelize.define('State', {
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
        tableName: 'states',
    }
    )

    State.associate = models => {
        State.belongsTo(models.Country,{foreignKey: 'country_id'});
        State.hasMany(models.District,{foreignKey: 'state_id'});
    }

    return State;
}
