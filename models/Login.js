
module.exports = function(sequelize, DataTypes){
    const Schema = {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        distributorId: {
            type: DataTypes.INTEGER,
            field: 'distributor_id',
            unique: true,
            foreignKey: true,
        },
        driverId: {
            type: DataTypes.INTEGER,
            field: 'driver_id',
            unique: true,
            foreignKey: true,
        },
        email: {
            type: DataTypes.STRING,
        },
        phone: {
            type: DataTypes.STRING,
        },
        password: {
            type: DataTypes.STRING,
        },
        active: {
            type: DataTypes.BOOLEAN,
            defaultValue : false,
        },
        otpCode: {
            type: DataTypes.INTEGER,
            field: 'otp_code'
        },
        setPasswordCode: {
            type: DataTypes.INTEGER,
            field: 'set_password_code'
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
    }
    
    const options = {
        tableName: 'login',
        paranoid: true,
    }
    
    const Login = sequelize.define('Login', Schema, options)

    Login.associate = models => {
        Login.hasOne(models.Distributor,{foreignKey: 'login_id'});
        Login.hasOne(models.Driver, {foreignKey: 'login_id'});
    }

    return Login;
}