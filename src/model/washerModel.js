const { sequelize,Sequelize, Sequelize: { DataTypes } } = require('../helper/db');
const {Schedule_vehicle} = require('../model/customerModel');

const Washer_service = sequelize.define('washer_service_images',{
    schedule_id : {
        type:DataTypes.INTEGER,
        allowNull: false
    },
    status:{
        type:DataTypes.INTEGER,
        allowNull: false
    },
    image:{
        type:DataTypes.STRING,
        allowNull: false
    },
    feedback:{
        type:DataTypes.STRING,
        allowNull: true
    },
    created_at:{
        type:DataTypes.DATE,
        defaultValue : new Date()
    },
    updated_at:{
        type:DataTypes.DATE,
        defaultValue : new Date()
    },
},{tableName : 'washer_service_images'});


const Service_Providers = sequelize.define("washers",{
    full_name:{
        type:DataTypes.STRING,
        allowNull: true
    },
    email:{
        type:DataTypes.STRING,
        allowNull: true
    },
    phone_num:{
        type:DataTypes.STRING,
        allowNull: true
    },
    otp:{
        type:DataTypes.NUMBER,
        allowNull: true
    },
    profile_status:{
        type:DataTypes.BOOLEAN,
        allowNull: true
    },
    address:{
        type:DataTypes.STRING,
        allowNull: true
    },
    state:{
        type:DataTypes.STRING,
        allowNull: true
    },
    country:{
        type:DataTypes.STRING,
        allowNull: true
    },
    city:{
        type:DataTypes.STRING,
        allowNull: true
    },
    image:{
        type:DataTypes.STRING,
        allowNull: true
    },
    created_at:{
        type:DataTypes.DATE,
        defaultValue : new Date()
    },
    updated_at:{
        type:DataTypes.DATE,
        defaultValue : new Date()
    },
},{tableName:'washers'});


// Washer_service.hasMany(Schedule_vehicle, {
//     foreignKey: {
//       name: 'id',
//       allowNull: false,
//     },
//     Washer_service : 'schedul_id',
//   })

// Washer_service.belongsTo(Schedule_vehicle,{foreignKey:'id'});
// Schedule_vehicle.hasMany(Washer_service,{foreignKey:'schedul_id'});

module.exports = {
    Washer_service, 
    Service_Providers
}