
module.exports = function(sequelize, DataTypes){
    const User = sequelize.define('User', {
        distributorId: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'distributor_id',
            foreignKey: true,
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
        phone: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        email: {
            type: DataTypes.STRING,
            unique: true,
            validate:{
                isEmail: true,
            }
        },
        referral: DataTypes.STRING,
        profilePicture: {
            type: DataTypes.STRING,
            field: 'profile_picture',
        },
        deletedAt: {
            type: DataTypes.DATE,
            field: 'deleted_at'
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            field: 'updated_at'
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            field: 'created_at'
        },
    },{
        tableName: 'users',
    }
    )

    User.associate = models => {
        User.belongsTo(models.Distributor,{foreignKey: 'distributor_id'});
        User.hasOne(models.Login, {foreignKey: 'user_id'});
    }

    return User;
}