const express = require('express');
const app = express();
const customerController = require('../controller/customerController');
const jwtToken = require('../helper/verifyToken');


app.post('/login',customerController.login);
app.post('/verifyOtp', customerController.otpVerify);
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
app.post('/setSchedule', jwtToken.validateToken, customerController.setschedule);
app.get('/home', jwtToken.validateToken, customerController.home);
app.get('/address', jwtToken.validateToken, customerController.address);
app.post('/addAdrress', jwtToken.validateToken, customerController.addParkingAdrress);
app.get('/afterService/:schedule_id', jwtToken.validateToken, customerController.afterService);
app.post('/feedback', jwtToken.validateToken, customerController.feedback);
app.post('/service_payment', jwtToken.validateToken, customerController.service_payment);
app.get('/transactionHistory', jwtToken.validateToken, customerController.transactionHistory);
app.post('/addComplaint', jwtToken.validateToken, customerController.addComplaint);
app.post('/service_amount', jwtToken.validateToken, customerController.service_amount);
app.post('/add_contactUs', jwtToken.validateToken, customerController.addContactUs);
app.get('/get_about_us', jwtToken.validateToken, customerController.get_about_us);



module.exports = app;