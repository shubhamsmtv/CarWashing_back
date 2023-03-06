const {sequelize,  Sequelize:{DataTypes}} = require('../helper/db');



const Customer = sequelize.define('users', {
    fullName : {
        type : DataTypes.STRING,
        allowNull: true
    },
    email : {
        type : DataTypes.STRING,
        allowNull: true
    },
    phoneNum : {
        type : DataTypes.STRING,
        allowNull : true
    },
    otp : {
        type : DataTypes.INTEGER,
        allowNull : true
    },
    fcm_token : {
        type : DataTypes.STRING,
        allowNull : true
    },
    device_type : {
        type : DataTypes.STRING,
        allowNull : true
    },
    status : {
        type : DataTypes.STRING,
        default : false
    },
    vehicle_status : {
        type : DataTypes.STRING,
        default : false
    },
    address : {
        type : DataTypes.TEXT,
        allowNull: true
    },
    wing : {
        type : DataTypes.STRING,
        allowNull: true
    },
    society : {
        type : DataTypes.STRING,
        allowNull: true
    },
    state : {
        type : DataTypes.STRING,
        allowNull: true
    },
    city : {
        type : DataTypes.STRING,
        allowNull: true
    },
    pincode : {
        type : DataTypes.INTEGER,
        allowNull: true
    },
    profile_img : {
        type : DataTypes.STRING,
        allowNull: true
    },
    createDate : {
        type : DataTypes.DATE,
        defaultValue : new Date()
    },
    updateDate : {
        type : DataTypes.DATE,
        defaultValue : new Date()
    }
},{tableName : 'users'});



const State = sequelize.define('states',{
    name : {
        type : DataTypes.STRING,
        allowNull: true
    },
    country_id : {
        type : DataTypes.INTEGER,
        allowNull: true
    },
},{tableName : 'states'});




const Cities = sequelize.define('cities',{
    name : {
        type : DataTypes.STRING,
        allowNull: true
    },
    state_id : {
        type : DataTypes.INTEGER,
        allowNull: true
    },
},{tableName : 'cities'});



const Pincode = sequelize.define('pincode',{
    pincode : {
        type : DataTypes.INTEGER,
        allowNull: true
    },
    city : {
        type : DataTypes.INTEGER,
        allowNull: true
    },
    state_id : {
        type : DataTypes.INTEGER,
        allowNull: true
    },
},{tableName:'pincode'});


const Customer_Vehilce = sequelize.define('customer_vehilce',{
    userId : {
        type : DataTypes.STRING,
        allowNull: true
    },
    vehicle_type : {
        type : DataTypes.STRING,
        allowNull: true
    },
    vehicle_title : {
        type: DataTypes.STRING,
        allowNull:true
    },
    image : {
        type : DataTypes.STRING,
        allowNull: true
    },
    vehicle_model : {
        type : DataTypes.STRING,
        allowNull: true
    },
    vehicle_color : {
        type : DataTypes.STRING,
        allowNull: true
    },
    license_num : {
        type : DataTypes.STRING,
        allowNull: true
    },
    parking_num : {
        type : DataTypes.STRING,
        allowNull: true
    },
    createDate : {
        type : DataTypes.DATE,
        allowNull: new Date()
    },
},{tableName:'customer_vehilce'});


const Wallet = sequelize.define('customer_wallet',{
    userId : {
        type : DataTypes.NUMBER,
        allowNull: true
    },
    amount : {
        type : DataTypes.NUMBER,
        allowNull: true
    },
    coupon_code : {
        type : DataTypes.STRING,
        allowNull: true
    },
    payment_method : {
        type : DataTypes.STRING,
        allowNull: true
    },
    createDate : {
        type : DataTypes.DATE,
        default: new Date()
    },
    updateDate : {
        type : DataTypes.DATE,
        default: new Date()
    }
},{tableName:"customer_wallet"});


const Schedule_vehicle = sequelize.define('schedule_vehicle',{
    userId : {
        type : DataTypes.NUMBER,
        allowNull : false
    },
    address : {
        type : DataTypes.STRING,
        allowNull : false
    },
    vehicle_id : {
        type : DataTypes.NUMBER,
        allowNull : false
    },
    schedule_date : {
        type : DataTypes.DATE,
        allowNull : false
    },
    createDate : {
        type : DataTypes.DATE,
        allowNull : new Date()
    }
},{tableName:'schedule_vehicle'});



Schedule_vehicle.belongsTo(Customer_Vehilce,{foreignKey: 'vehicle_id'});
Customer_Vehilce.hasMany(Schedule_vehicle,{foreignKey : 'id'});

module.exports = {
    Customer,
    State,
    Cities,
    Pincode,
    Customer_Vehilce,
    Wallet,
    Schedule_vehicle
}