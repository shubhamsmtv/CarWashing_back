const express = require('express');
const app = express();
const washerController = require('../controller/washerController');
const jwtToken = require('../helper/verifyToken');


app.post('/addService', jwtToken.validateToken, washerController.add_service);
app.post('/washerLog', washerController.login);
app.post('/washerOtpverify', washerController.otpVerify)
app.post('/completeProfile', jwtToken.validateToken, washerController.completeProfile);
app.get('/getprofile',jwtToken.validateToken, washerController.getProfile);
app.get('/assignTaskList', jwtToken.validateToken, washerController.assignTaskList);
app.post('/service_status', jwtToken.validateToken, washerController.service_status);
app.get('/taskHistory', jwtToken.validateToken, washerController.taskHistory);


module.exports = app;