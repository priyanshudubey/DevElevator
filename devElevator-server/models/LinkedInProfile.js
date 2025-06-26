const { DataTypes } = require("sequelize");
const sequelize = require("../config/mysql"); // your Sequelize instance

const LinkedInProfile = sequelize.define("LinkedInProfile", {
  mongoUserId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  fileName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  filePath: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  uploadedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});

module.exports = LinkedInProfile;
