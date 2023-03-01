const express = require('express');
const app = express();
const customerController = require('../controller/customerController');
const jwtToken = require('../helper/verifyToken');

app.post('/register',customerController.register);
app.post('/verifyOtp', customerController.otpVerify);
app.post('/login',customerController.login);
app.get('/getProfile',jwtToken.validateToken, customerController.getProfile);
app.post('/complitProfile', jwtToken.validateToken, customerController.complitProfile);
app.get('/getVehilceCategory', jwtToken.validateToken, customerController.getVehilceCategory);
app.get('/getVehicleType', jwtToken.validateToken, customerController.getVehicleType);
app.get('/getState', customerController.getState);
app.get('/getCity/:stateID', customerController.getCity);
app.post('/getPincode', customerController.getPincode);
app.post('/addVehicle', customerController.addVehicle);
module.exports = app;