const express = require('express');
const app = express();
const customerRouter = require('./router/customerRoute');
const adminRouter = require('./router/adminRouter');

app.use('/customer', customerRouter);
app.use('/admin', adminRouter);

module.exports = app;