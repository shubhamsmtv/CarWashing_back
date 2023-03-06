const express = require('express');
const app = express();
const customerController = require('../controller/customerController');
const jwtToken = require('../helper/verifyToken');

// app.post('/register',customerController.register);
app.post('/verifyOtp', customerController.otpVerify);
app.post('/login',customerController.login);
app.get('/getProfile',jwtToken.validateToken, customerController.getProfile);
app.post('/complitProfile', jwtToken.validateToken, customerController.complitProfile);
app.get('/getVehilceCategory', jwtToken.validateToken, customerController.getVehilceCategory);
app.get('/getVehicleType', jwtToken.validateToken, customerController.getVehicleType);
app.get('/getState', customerController.getState);
app.get('/getCity/:stateID', customerController.getCity);
app.post('/getPincode', customerController.getPincode);
app.post('/addVehicle',jwtToken.validateToken, customerController.addVehicle);
app.get('/vehicleList',jwtToken.validateToken, customerController.vehicleList);
app.get('/getVehicleById/:vehicleId', jwtToken.validateToken, customerController.getVehicleById);
app.post('/updateVehicle', jwtToken.validateToken, customerController.updateVehicle);
app.delete('/deleteVehicle/:vehicleId',jwtToken.validateToken,customerController.deleteVehicle);
app.post('/addWallet',jwtToken.validateToken, customerController.addWallet);
app.get('/walletHistory', jwtToken.validateToken, customerController.getWallet);
app.get('/walletBalance', jwtToken.validateToken, customerController.walletBalance);
app.get('/myServices', jwtToken.validateToken, customerController.my_services);
app.post('/uploadProfile', jwtToken.validateToken, customerController.uploadProfile);
app.post('/setSchedule', jwtToken.validateToken, customerController.setschedule)
module.exports = app;