const mysql = require('mysql');
const connection = mysql.createConnection({
	host:'localhost',
	user:'root',
	password:'@Master2023',
	database:'whatsapp',
	port:2233
});
connection.connect(function(error){
	if(!!error) {
		console.log('DATABASE: '+error);
	} else {
		console.log('DATABASE: Connected Successfully..!!');
	}
});

module.exports = connection;