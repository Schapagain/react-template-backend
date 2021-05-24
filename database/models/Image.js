const { NotFoundError } = require("../../utils/errors");

module.exports = function (sequelize, DataTypes) {
  const Image = sequelize.define(
    "Image",
    {
      userId: {
        type: DataTypes.UUID,
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
      albumId: {
        type: DataTypes.INTEGER,
        foreignKey: true,
        validate: {
          async albumExists(id) {
            const album = await sequelize.models.Album.findOne({
              where: { id },
            });
            if (!album) throw new NotFoundError("album");
          },
        },
      },
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      src: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      secureSrc: DataTypes.STRING,
      width: DataTypes.INTEGER,
      height: DataTypes.INTEGER,
      placeholder: DataTypes.STRING,
      format: DataTypes.STRING,
      size: DataTypes.INTEGER,
    },
    {
      tableName: "images",
      underscored: true,
      timestamps: true,
      paranoid: true,
    }
  );

  Image.associate = (models) => {
    Image.belongsTo(models.User, { foreignKey: "user_id" });
    Image.belongsTo(models.Album, { foreignKey: "album_id", as: "album" });
  };

  return Image;
};
