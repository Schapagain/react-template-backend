module.exports = function (sequelize, DataTypes) {
  const Schema = {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      unique: true,
      foreignKey: true,
    },
    username: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: (username) => username && username.length > 4,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  };

  const options = {
    tableName: "login",
    underscored: true,
    timestamps: true,
    paranoid: true,
  };

  const Login = sequelize.define("Login", Schema, options);

  Login.associate = (models) => {
    Login.hasOne(models.User, { foreignKey: "login_id" });
  };

  return Login;
};
