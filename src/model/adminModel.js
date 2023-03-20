const { sequelize, Sequelize,Sequelize: { DataTypes } } = require('../helper/db');
const {Schedule_vehicle,Customer_Vehilce} = require('../model/customerModel');

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
    created_at: {
        type: DataTypes.DATE,
        allowNull: new Date()
    },
    updated_at: {
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
    created_at: {
        type: DataTypes.DATE,
        allowNull: new Date()
    }
},{tableName:'admin'});

const Washer_task = sequelize.define('washer_assign_task',{
    schedul_id : {
        type : DataTypes.NUMBER,
        allowNull : false
    },
    washer_id : {
        type : DataTypes.NUMBER,
        allowNull : false
    },
    status : {
        type : DataTypes.STRING,
        allowNull : true
    },
    comment : {
        type : DataTypes.STRING,
        allowNull : true
    },
    created_at : {
        type : DataTypes.DATE,
        allowNull : new Date()
    },
    updated_at : {
        type : DataTypes.DATE,
        allowNull : new Date()
    },
},{tableName:'washer_assign_task'});

Washer_task.belongsTo(Schedule_vehicle,{foreignKey: 'schedul_id'});
Schedule_vehicle.hasMany(Washer_task,{foreignKey : 'id'});

const Service_payment = sequelize.define('service_payment',{
    user_id : {
        type : DataTypes.NUMBER,
        allowNull : false
    },
    schedul_id : {
        type : DataTypes.NUMBER,
        allowNull : false
    },
    transaction_id : {
        type : DataTypes.NUMBER,
        allowNull : false
    },
    txn_type : {
        type : Sequelize.ENUM('Credit','Debit'),
        defaultValue : 'Debit'
    },
    payment_method : {
        type : DataTypes.STRING,
        defaultValue : 'wallet'
    },
    amount : {
        type : DataTypes.NUMBER,
        allowNull : false
    },
    created_at : {
        type : DataTypes.DATE,
        allowNull : new Date()
    },
    updated_at : {
        type : DataTypes.DATE,
        allowNull : new Date()
    }
},{tableName:"service_payment"})



const Setting = sequelize.define('setting',{
    key_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    value: {
        type: DataTypes.STRING,
        allowNull: false
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: new Date()
    },
    updated_at: {
        type: DataTypes.DATE,
        allowNull: new Date()
    }
},{tableName:'setting'});


const AboutUs = sequelize.define('aboutus', {
    title: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    description: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: new Date()
    },
    updated_at: {
        type: DataTypes.DATE,
        allowNull: new Date()
    }
},{tableName:'aboutus'});


const ContactUs = sequelize.define('contactus', {
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    message: {
      type: Sequelize.STRING,
      allowNull: false,
    },
  },{tableName:'contactus'});

module.exports = {
    Vehicle_category,
    Admin,
    Washer_task,
    Service_payment,
    Setting,
    AboutUs,
    ContactUs
}