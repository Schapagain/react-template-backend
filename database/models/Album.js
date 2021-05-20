const { NotFoundError } = require("../../utils/errors");

module.exports = function (sequelize, DataTypes) {
  const Album = sequelize.define(
    "Album",
    {
      userId: {
        type: DataTypes.INTEGER,
        foreignKey: true,
        validate: {
          async userExists(id) {
            const user = await sequelize.models.User.findOne({
              where: { id },
            });
            if (!user) throw new NotFoundError("user");
          },
        },
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
    },
    {
      tableName: "albums",
      paranoid: true,
      underscored: true,
      timestamps: true,
    }
  );

  Album.associate = (models) => {
    Album.belongsTo(models.User, { foreignKey: "user_id" });
    Album.hasMany(models.Image, { foreignKey: "album_id" });
  };

  return Album;
};
