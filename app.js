require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const fileUpload = require('express-fileupload');
const cors = require('cors');
const fs = require("fs")

const mainRouter = require('./src/index');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(fileUpload());
app.use(cors());


app.use('/', mainRouter);

if (process.env.SSl === "true") {
    var https = require('https');
    var httpsOptions = {
        key: fs.readFileSync('/www/server/panel/vhost/cert/dihady.com/privkey.pem'),
        cert: fs.readFileSync('/www/server/panel/vhost/cert/dihady.com/fullchain.pem')
    };

    var httpsServer = https.createServer(httpsOptions, app);
}


const PORT = process.env.PORT;
if (process.env.SSl == "true") {
    httpsServer.listen(PORT, function () {
        console.log('listening on *:' + PORT);
    });
} else {
    app.listen(PORT, () => {
        console.log(`SERVER RUNNING ON THE PORT ${PORT}`);
    })
}