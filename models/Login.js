
module.exports = function(sequelize, DataTypes){
    const Schema = {
        id: {
            type: DataTypes.STRING,
            allowNull: false,
            primaryKey: true,
        },
        email: {
            type: DataTypes.STRING,
            unique: true,
        },
        phone: {
            type: DataTypes.STRING,
            unique: true,
        },
        password: {
            type: DataTypes.STRING,
        },
        role: {
            type: DataTypes.STRING,
            allowNull: false
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

    return Login;
}