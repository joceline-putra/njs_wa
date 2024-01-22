const mysql = require('mysql');
const connection = mysql.createConnection({
	host:'127.0.0.1',
	user:'root',
	password:'@Master2023',
	database:'whatsapp'
});
connection.connect(function(error){
	if(!!error) {
		console.log('DATABASE: '+error);
	} else {
		console.log('DATABASE: Connected Successfully..!!');
	}
});

module.exports = connection;