// var express     = require('express');
// var app         = express.Router();
const { Router } 	= require('express'); 
const app			= Router(); 
const helper        = require("./../helper.js");

var cn          	= require("../config/database");

app.get('/user', (req, res) => {
	res.send("user"); 
	// console.log('routes/user');
	// res.send('routes/user')
	// res.json({status:0,message:'routes/user'});
})
module.exports = app;