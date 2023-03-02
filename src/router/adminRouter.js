const express = require('express');
const app = express();
const adminController = require('../controller/adminController');
const authValidation = require('../helper/verifyToken');

app.post('/login', adminController.login);
app.post('/vehicleCategory', adminController.vehicleCategory);
app.get('/customers',authValidation.validateToken, adminController.getCustomer);
app.get('/getCustomer/:Id', authValidation.validateToken, adminController.customerEdit);
app.post('/updateCustomer', authValidation.validateToken, adminController.updateCustomer);
// app.post('addCustomer',authValidation.validateToken, adminController.addCustomer);

app.get('/vehicles',authValidation.validateToken, adminController.vehicles);

module.exports = app;