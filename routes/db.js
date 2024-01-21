const mysql = require('mysql');
const connection = mysql.createConnection({
	host:'localhost',
	user:'root',
	password:'',
	database:'edu_smart'
});
connection.connect(function(error){
	if(!!error) {
		console.log('DATABASE: '+error);
	} else {
		console.log('DATABASE: Connected Successfully..!!');
	}
});

module.exports = connection;