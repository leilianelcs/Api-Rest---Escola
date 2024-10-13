const { connection } = require("../database/connection")
const {DataTypes} = require("sequelize")

const User = connection.define('user', {
    name: {
        type: DataTypes.STRING
    },
    email: {
        type: DataTypes.STRING,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
})

module.exports = User