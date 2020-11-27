

module.exports = function(sequelize, DataTypes) {
    const District = sequelize.define('District', {
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
        tableName: 'districts',
    }
    )

    District.associate = models => {
        District.belongsTo(models.State,{foreignKey: 'state_id'});
    }

    return District;
}
