const express = require('express');
const app = express();
const customerRouter = require('./router/customerRoute');
const adminRouter = require('./router/adminRouter');
const washers = require('./router/washerRouter');

app.use('/customer', customerRouter);
app.use('/admin', adminRouter);
app.use('/washers', washers);


module.exports = app;