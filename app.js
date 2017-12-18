require('dotenv').config();
var express = require('express');
var app = express();
var port = process.env.PORT;
var Routes = require('./Routes/');
var chalk = require('chalk');
var date = new Date();

app.set('view engine', 'ejs');

Routes(app);

app.listen(port);
console.log(chalk.cyanBright.bold(date.getHours() + ':' +
                                  date.getSeconds() + ':' +
                                  date.getMilliseconds() +
                                  ' — Listening On Port', port));