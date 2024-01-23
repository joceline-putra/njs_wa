require('dotenv/config')
const mysql = require('mysql');
const connection = mysql.createConnection({
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_DATABASE,
	port: process.env.DB_PORT
});
connection.connect(function(error){
	if(!!error) {
		console.log('DATABASE: '+error);
	} else {
		console.log('DATABASE: Connected');
	}
});

module.exports = connection;