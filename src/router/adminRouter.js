const express = require('express');
const app = express();
const adminController = require('../controller/adminController');
const authValidation = require('../helper/verifyToken');

app.post('/login', adminController.login);
app.post('/vehicleCategory', adminController.vehicleCategory);
app.get('/customers',authValidation.validateToken, adminController.getCustomer);
app.get('/getCustomer/:Id', authValidation.validateToken, adminController.customerEdit);
app.post('/updateCustomer', authValidation.validateToken, adminController.updateCustomer);
app.post('/addResidents',authValidation.validateToken, adminController.addCustomer);
app.delete('/deleteResidents/:id', authValidation.validateToken, adminController.deleteResidents);
app.get('/adminProfile', authValidation.validateToken, adminController.getProfile);
app.get('/service_providers_list', authValidation.validateToken, adminController.service_Providers_list)
app.get('/service_providers_ById/:id', authValidation.validateToken, adminController.service_Providers_ById);
app.post('/update_service_providers', authValidation.validateToken, adminController.update_service_providers);
app.delete('/delete_service_providers/:id', authValidation.validateToken, adminController.delete_service_providers)
app.get('/schedule_list', authValidation.validateToken, adminController.schedule_list);
app.post('/assignTask', authValidation.validateToken, adminController.assignTask);
// app.get('/vehicles',authValidation.validateToken, adminController.vehicles);
app.get('/dashboard', authValidation.validateToken, adminController.dashboard);

module.exports = app;

