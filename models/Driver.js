
module.exports = function( sequelize, DataTypes){
    const Driver = sequelize.define('Driver', {
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
        licenseDocument: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'license_document'
        },
        phone: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        dob: DataTypes.DATE,
        address : DataTypes.STRING,
        profilePicture: {
            type: DataTypes.STRING,
            field: 'profile_picture',
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
        tableName: 'drivers',
        paranoid: true,
        classMethods: {
            associate({ Distributor }){
                Driver.belongsTo(Distributor, {
                    foreignKey: 'distributor_id'
                })
            }
        }
    }
    )

    return Driver;
}