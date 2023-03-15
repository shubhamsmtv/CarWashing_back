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
// app.get('/workStatus', jwtToken.validateToken, washerController.workStatus);
module.exports = app;