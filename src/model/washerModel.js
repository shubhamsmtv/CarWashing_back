const { sequelize, Sequelize: { DataTypes } } = require('../helper/db');


const Washer_service = sequelize.define('washer_services',{
    userId : {
        type:DataTypes.INTEGER,
        allowNull: false
    },
    date:{
        type:DataTypes.DATE,
        allowNull: false
    },
    time:{
        type:DataTypes.STRING,
        allowNull: false
    },
    image:{
        type:DataTypes.STRING,
        allowNull: false
    }
},{tableName : 'washer_services'});


const Service_Providers = sequelize.define("service_providers",{
    fullName:{
        type:DataTypes.STRING,
        allowNull: true
    },
    email:{
        type:DataTypes.STRING,
        allowNull: true
    },
    phoneNum:{
        type:DataTypes.STRING,
        allowNull: true
    },
    otp:{
        type:DataTypes.NUMBER,
        allowNull: true
    },
    Pro_status:{
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
    createDate:{
        type:DataTypes.STRING,
        allowNull: true
    },
    updateDate:{
        type:DataTypes.STRING,
        allowNull: true
    },
},{tableName:'service_providers'});





module.exports = {
    Washer_service,
    Service_Providers
}