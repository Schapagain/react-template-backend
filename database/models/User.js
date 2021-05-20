const { ValidationError, NotUniqueError } = require("../../utils/errors");

module.exports = function (sequelize, DataTypes) {
  const User = sequelize.define(
    "User",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      loginId: {
        type: DataTypes.INTEGER,
        foreignKey: true,
      },
      name: {
        type: DataTypes.STRING,
      },
      profilePicture: {
        type: DataTypes.STRING,
      },
    },
    {
      paranoid: true,
      underscored: true,
      tableName: "users",
      timestamps: true,
    }
  );

  User.associate = (models) => {
    User.hasOne(models.Login, { foreignKey: "user_id" });
    User.hasMany(models.Album, { foreignKey: "user_id" });
    User.hasMany(models.Image, { foreignKey: "user_id" });
  };

  return User;
};
