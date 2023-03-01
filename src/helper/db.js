const Sequelize = require('sequelize');
const sequelize = new Sequelize(process.env.DB_NAME,process.env.DB_USER,process.env.DB_PASSWORD,{
    timezone: 'Asia/Kolkata', //We tried, ETC/GMT0+05:30
    host : 'localhost',
    dialect : "mysql",
    define : {
        timestamps : false,
    },
    logging :false,
});

module.exports = {
    sequelize, Sequelize
};