

module.exports = function(sequelize, DataTypes) {
    const Package = sequelize.define('Package', {
        distributorId: {
            type: DataTypes.INTEGER,
            field: 'distributor_id',
            validate: {
                isNotSuperuser(id){
                    if (Number(id) <= 1)
                        throw new ValidationError('distributorId','must be greater than 1');
                }
            }
        },
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        price: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        duration: {
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
        tableName: 'packages',
    }
    )

    Package.associate = models => {
        Package.belongsTo(models.Distributor,{foreignKey: 'distributor_id'});
        Package.hasMany(models.Subscription,{foreignKey: 'package_id'});
    }

    return Package;
}
