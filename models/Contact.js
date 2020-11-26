

module.exports = function(sequelize, DataTypes) {
    const Contact = sequelize.define('Contact', {
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
        jobPosition: {
            type: DataTypes.STRING,
            field: 'job_position',
        },
        title: DataTypes.STRING,
        email: DataTypes.STRING,
        phone: DataTypes.STRING,
        mobile: DataTypes.STRING,
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
        tableName: 'contacts',
        paranoid:true,
    }
    )

    return Contact;
}
