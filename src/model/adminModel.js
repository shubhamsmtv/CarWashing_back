const { Model, DATE } = require('sequelize');
const { sequelize, Sequelize: { DataTypes } } = require('../helper/db');


const Vehicle_category = sequelize.define('vehicle_category', {
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    vehicle_type: {
        type: DataTypes.STRING,
        allowNull: false
    },
    images: {
        type: DataTypes.STRING,
        allowNull: false
    },
    createDate: {
        type: DataTypes.DATE,
        allowNull: new Date()
    },
    updateDate: {
        type: DataTypes.DATE,
        allowNull: new Date()
    },
}, { tableName: 'vehicle_category' });


const Admin = sequelize.define('admin',{
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    createDate: {
        type: DataTypes.DATE,
        allowNull: new Date()
    },
},{tableName:'admin'});

module.exports = {
    Vehicle_category,
    Admin
}