
const { ValidationError, NotFoundError} = require('../../utils/errors');

module.exports = function( sequelize, DataTypes){
    const Subscription = sequelize.define('Subscription', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        type:{
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                async isValidType(type){
                    const validSubscriptions = new Set(['package','profit sharing']);
                    if (!validSubscriptions.has(type))
                        throw new ValidationError('type','must be one of: ' + [...validSubscriptions].join(','))
                    
                    if (type === 'package' && !this.packageId)
                        throw new ValidationError('packageId')

                    if (type === 'profit sharing' && !this.cutPercent)
                        throw new ValidationError('cutPercent')
                }
            }
        },
        distributorId:{
            type: DataTypes.INTEGER,
            foreignKey: true,
            field: 'distributor_id'
        },
        packageId:{
            type: DataTypes.STRING,
            field: 'package_id',
            foreignKey: true,
            validate: {
                async packageExists(packageId){
                    const package = await sequelize.models.Package.findOne({where:{id:packageId}});
                    if (!package)
                        throw new NotFoundError('package');
                }
            }
        },
        cutPercent:{
            type: DataTypes.INTEGER,
            field: 'cut_percent',
            validate: {
                async isValidPercent(cut){
                    if (cut<0 || cut>100)
                        throw new ValidationError('percentage')
                }
            }
        },
        startsAt:{
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            field: 'starts_at'
        },
        expiresAt: {
            type: DataTypes.DATE,
            allowNull: false,
            field: 'expires_at',
            validate: {
                expiresInFuture(expiry){
                    if (expiry < this.startsAt)
                        throw new ValidationError('expiresAt','must be in the future')
                }
            }
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
        paranoid: true,
        tableName: 'subscriptions'
    }
    )

    Subscription.associate = models => {
        Subscription.belongsTo(models.Distributor,{foreignKey: 'distributor_id'});
        Subscription.belongsTo(models.Package,{foreignKey: 'package_id'});
        Subscription.hasOne(models.Driver,{foreignKey: 'subscription_id'});
    }

    return Subscription;
}