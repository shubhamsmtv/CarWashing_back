const {sequelize,Sequelize,  Sequelize:{DataTypes}} = require('../helper/db');



const Customer = sequelize.define('users', {
    fullName : {
        type : DataTypes.STRING,
        allowNull: true
    },
    email : {
        type : DataTypes.STRING,
        allowNull: true
    },
    phone_num : {
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
    created_at : {
        type : DataTypes.DATE,
        defaultValue : new Date()
    },
    updated_at : {
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
    user_id : {
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
    created_at : {
        type : DataTypes.DATE,
        allowNull: new Date()
    },
},{tableName:'customer_vehilce'});


const Wallet = sequelize.define('customer_wallet',{
    user_id : {
        type : DataTypes.NUMBER,
        allowNull: true
    },
    amount : {
        type : DataTypes.NUMBER,
        allowNull: true
    },
    txn_type : {
        type : DataTypes.NUMBER,
        allowNull: true
    },
    comment : {
        type : DataTypes.NUMBER,
        allowNull: true
    },
    txn_id : {
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
    created_at : {
        type : DataTypes.DATE,
        default: new Date()
    },
    updated_at : {
        type : DataTypes.DATE,
        default: new Date()
    }
},{tableName:"customer_wallet"});


const Schedule_vehicle = sequelize.define('schedule_service',{
    user_id : {
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
    vehicle_type : {
        type : DataTypes.STRING,
        allowNull : false
    },
    vehicle_title : {
        type : DataTypes.STRING,
        allowNull : false
    },
    image : {
        type : DataTypes.STRING,
        allowNull : false
    },
    vehicle_model : {
        type : DataTypes.STRING,
        allowNull : false
    },
    vehicle_color : {
        type : DataTypes.STRING,
        allowNull : false
    },
    license_num : {
        type : DataTypes.STRING,
        allowNull : false
    },
    status : {
        type : Sequelize.ENUM('Pending','confirmed','In-progress','Completed','Canceled'),
        defaultValue : 'Pending'
    },
    lat : {
        type : DataTypes.FLOAT,
        allowNull : null
    },
    lng : {
        type : DataTypes.FLOAT,
        allowNull : null
    },
    start_date : {
        type : DataTypes.DATE,
        allowNull : false
    },
    end_date : {
        type : DataTypes.DATE,
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
},{tableName:'schedule_service'});


const Slider = sequelize.define('slider',{
    title : {
        type : DataTypes.DATE,
        allowNull : new Date()
    },
    image : {
        type : DataTypes.DATE,
        allowNull : new Date()
    },
    slider_type : {
        type : DataTypes.DATE,
        allowNull : new Date()
    },
    redirect_id : {
        type : DataTypes.DATE,
        allowNull : new Date()
    },
    click_count : {
        type : DataTypes.DATE,
        allowNull : new Date()
    },
    created_at: {
        type : DataTypes.DATE,
        allowNull : new Date()
    },
    updated_at : {
        type : DataTypes.DATE,
        allowNull : new Date()
    }
},{tableName:'slider'});



const Address = sequelize.define('parking_address',{
    parking_type:{
        type : Sequelize.ENUM("Public", "Private", "Office","Home"),
        allowNull: 'Home'
    },
    user_id:{
        type : DataTypes.STRING,
        allowNull : false
    },
    address:{
        type : DataTypes.STRING,
        allowNull: false
    },
    building:{
        type : DataTypes.STRING,
        allowNull: false
    },
    society_name:{
        type : DataTypes.STRING,
        allowNull: false
    },
    lot_num:{
        type : DataTypes.STRING,
        allowNull: false
    },
    lat:{
        type : DataTypes.FLOAT,
        allowNull: true
    },
    lng:{
        type : DataTypes.FLOAT,
        allowNull: true
    },
    created_at: {
        type : DataTypes.DATE,
        allowNull : new Date()
    },
    updated_at:{
        type : DataTypes.DATE,
        allowNull : new Date()
    },
},{tableName:'parking_address'});

Schedule_vehicle.belongsTo(Customer_Vehilce,{foreignKey: 'vehicle_id'});
Customer_Vehilce.hasMany(Schedule_vehicle,{foreignKey : 'id'});


const Complaint = sequelize.define('customer_complaint',{
    user_id : {
        type : DataTypes.NUMBER,
        allowNull : false
    },
    image : {
        type : DataTypes.STRING,
        allowNull : false
    },
    description : {
        type : DataTypes.STRING,
        allowNull : false
    },
    status : {
        type : Sequelize.ENUM("Resolve", "Revert_payment", "Pending","Canceled"),
        defaultValue: "Pending"
    },
    created_at: {
        type : DataTypes.DATE,
        allowNull : new Date()
    },
    updated_at:{
        type : DataTypes.DATE,
        allowNull : new Date()
    }
},{tableName:"customer_complaint"});



module.exports = {
    Customer,
    State,
    Cities,
    Pincode,
    Customer_Vehilce,
    Wallet,
    Schedule_vehicle,
    Slider,
    Address,
    Complaint
}