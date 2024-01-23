const { Router } 	= require('express'); 
const app			= Router(); 
const {myAsyncFunction, myAsyncFunction2}        = require("./../helper.js");

var cn          	= require("../config/database");
const deviceModel = require('../models/device.model');

const device = new deviceModel();

app.get('/devices', (req, res) => {
    let body = req.query;
    // let body = req.body;
    let action = body.action;
    let auth = body.auth;
    let sender = body.sender;
    let recipient= body.recipient;
    let content = body.content;
    
    console.log("Node: Body => "+JSON.stringify(body));
    if(req.query.action == '' || req.query.action === undefined){   
        res.status(200).json({
            status: 0,
            message: 'Action Not Found',
        });
    }else{       
        switch(action){
            case "new": //Not Used
                client.initialize();
                client.on('qr', (qr) => {
                    // NOTE: This event will not be fired if a session is specified.
                    console.log('QR Generate');
                    console.log(qr);
                    qrcode_terminal.generate(qr, {small: true});
                });
                client.on('authenticated', () => {
                    console.log('AUTHENTICATED');
                });
                client.on('auth_failure', msg => {
                    // Fired if session restore was unsuccessful
                    console.error('AUTHENTICATION FAILURE', msg);
                });
                
                client.on('ready', () => {
                    console.log('READY');
                    client.sendMessage("6281225518118@c.us", "hello");
                });
                client.on('message', async msg => {
                    // console.log('MESSAGE RECEIVED', msg);
                
                    if (msg.body === '!ping reply') {
                        // Send a new message as a reply to the current one
                        msg.reply('pong');
                
                    } else if (msg.body === '!ping') {
                        // Send a new message to the same chat
                        client.sendMessage(msg.from, 'pong');
                
                    } 
                });
                client.on('disconnected', (reason) => {
                    console.log('Client was logged out', reason);
                });
                break;
            case "send-message": //wa
                // if(!(body.recipient) === undefined){
                    console.log("Recipient: "+recipient);
                    console.log("Node: "+content);
                    // client.sendMessage(recipient+'@c.us', content)
                    var rc = recipient+"@c.us";
                    client.sendMessage(rc, content)
                    .then(response => {
                        res.status(200).json({
                            status: 1,
                            message: 'Message Sent;',
                            result: response,
                        });
                    })
                    .catch(error => {
                        res.status(200).json({
                            status: 0,
                            message: 'Message Not Sent;',
                            result: error,
                        });
                    });   
                // }else{
                //     res.status(200).json({
                //         status: 0,
                //         message: 'Receipient not defined'
                //     });          
                // }
                break;
            case "load":
                // http://localhost:8000/devices?action=load-user&order=user_id&start=0&limit=10&dir=asc
				var order = body.order;
				var limit = body.limit;
				if(!(body["order"] === undefined)){ order = " ORDER BY `" + body["order"] + "` " + body["dir"].toUpperCase(); }else{ order = '';  }
				if(!(body["limit"] === undefined)){ limit = " LIMIT " + body["start"] + "," + body["limit"]; }else{ limit = ' LIMIT 0,10'; }
				
				var sql = "SELECT * FROM `devices`" + order + "" + limit;
				console.log("Node: Query => " + sql);
				var query = cn.query(sql, (err, results) => {
					if (!err) {
                        /* var json = JSON.parse(JSON.stringify(results)); */
                        //Fetch message
                        var enqueList = [];
                        results.forEach(async (v, i) => {
                            var row = {
                                id:v['device_id'],
                                session:v['device_session'],
                                label:v['device_label'],
                                number:v['device_number'],
                                auth:v['device_auth'],
                                flag:v['device_flag'],
                                date_created:v['device_date_created']
                            };
                            enqueList.push(row);
                        });
                                                
                        res.status(200).json({
                            status: 1,
                            message: 'Load',
                            result: enqueList,
                            total_records: results.length
                        });                          
                        console.log('Node: Works');  
					} else {
                        res.status(200).json({
                            status: 0,
                            message: err.sqlMessage
                        });                    
                        console.log("Error: " + err.sqlMessage);                                
                    }
				});
                break;
            case "send": //wa
                // http://localhost:8000/devices?action=send
				var order = body.order;
				var limit = body.limit;
				// if(!(body["order"] === undefined)){ order = " ORDER BY `" + body["order"] + "` " + body["dir"].toUpperCase(); }else{ order = ' ORDER BY message_id DESC';  }
				// if(!(body["limit"] === undefined)){ limit = " LIMIT " + body["start"] + "," + body["limit"]; }else{ limit = ' LIMIT 0,1'; }
				
				// var sql = "SELECT * FROM `messages`" + order + "" + limit;
				var sql = "SELECT * FROM `messages` WHERE message_flag=0 ORDER BY message_id ASC LIMIT 0,25";                
				console.log("Node: Query => " + sql);
				var query = cn.query(sql, (err, results) => {
					if (!err) {

                        //Fetch message
                        var enqueList = [];
                        results.forEach(async (v, i) => {
                            var row = {
                                id:v['message_id'],
                                text:v['message_text'],
                                recipient:v['message_contact_number'],
                                flag:v['message_flag']
                            };
                            enqueList.push(row);
                        });

                        //Prepare for send message
                        enqueList.forEach(async (v, i) =>{
                            var rc = v['recipient']+"@c.us";
                            client.sendMessage(rc, v['text'])
                            .then(response => {
                                // res.status(200).json({
                                //     status: 1,
                                //     message: 'Message Sent;',
                                //     result: response,
                                // });
                                console.log('WhatsApp: '+rc+' ['+v['id']+'] Sent');
                            })
                            .catch(error => {
                                // res.status(200).json({
                                //     status: 0,
                                //     message: 'Message Not Sent;',
                                //     result: error,
                                // });
                                console.log('WhatsApp: '+rc+' ['+v['id']+'] Not Sent');
                            });                             
                        });  
                        res.status(200).json({
                            status: 1,
                            message: 'Cronjob Success'
                        });                         
					} else {
                        res.status(200).json({
                            status: 0,
                            message: err.sqlMessage
                        });                    
                        console.log("Error: " + err.sqlMessage);                                
                    }
				});
                break;
            case "helper1":
                var a = myAsyncFunction();
                console.log(a);
                break;
            case "read":
                // https://medium.com/@devharipragaz007/simplifying-mysql-operations-in-node-js-with-a-custom-extendable-class-d77623dab710
                device.findById(1).then((result) => {
                    console.log('User with ID 1:', result);
                }).catch((error) => {
                    console.error('Error retrieving user:', error);
                });
                break;            
            default:
                res.status(200).json({
                    status: 0,
                    message: 'Nothing to do',
                });                
                break;
        }
    }
});

module.exports = app;