require('dotenv/config')
const {Client, LocalAuth, MessageMedia} = require('whatsapp-web.js');
const fs                  = require('fs');
const express             = require('express');
const qrcode           = require('qrcode');
const qrcode_terminal  = require('qrcode-terminal');
// const socketIO      = require('socket.io');
const http             = require('http');

const cn               = require("./src/config/database");
const {myAsyncFunction, myAsyncFunction2, returnJson, removeStringSender}        = require("./src/helper.js");

//Sementara copy dari /src/routes/devices.js
const device_Model = require('./src/models/device_model');
const deviceModel = new device_Model();

let qrcodeApi = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=';
//End Sementara copy dari /src/routes/devices.js

// Router
// var deviceRouter    = require("./src/routes/devices");
var messageRouter   = require("./src/routes/messages");
var chatRouter   = require("./src/routes/chats");

// initial instance
const PORT = process.env.APP_PORT || 3000;
const app = express();
const server = http.createServer(app);

// Index Routing and Middleware
// app.use(deviceRouter);
app.use(messageRouter);
app.use(chatRouter);

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.get('/', (req, res) => {
    res.sendFile('index.html', {root: __dirname});
});

// Server Listening
server.listen(PORT, () => {
    console.log('App listen on port ', PORT);
});

// const client = new Client({
//     authStrategy: new LocalAuth()
// });
// const client = new Client();

const client = new Client({
    authStrategy: new LocalAuth({
        clientId: 'sessionKamu',
        dataPath: './.wwebjs_auth',
        // store:storedd,
        backupSyncIntervalMs: 600000
    }),
    // proxyAuthentication: { username: 'username', password: 'password' },
    puppeteer: { 
        // args: ['--proxy-server=proxy-server-that-requires-authentication.example.com'],
        args: ['--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-extensions',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process', // <- this one doesn't works in Windows
        '--disable-gpu'],
        headless: true
    }
});
// Check if a session file exists and load it if so
// const SESSION_FILE_PATH = './session.json';
// let sessionCfg;
// if (fs.existsSync(SESSION_FILE_PATH)) {
//     sessionCfg = require(SESSION_FILE_PATH);
// }
// const client = new Client({
//     puppeteer: {
//         headless: false,
//         args: ['--no-sandbox',
//         '--disable-setuid-sandbox',
//         '--disable-extensions',
//         '--disable-dev-shm-usage',
//         '--disable-accelerated-2d-canvas',
//         '--no-first-run',
//         '--no-zygote',
//         '--single-process', // <- this one doesn't works in Windows
//         '--disable-gpu']
//     },
//     executablePath: '/usr/bin/google-chrome-stable',
//     session: sessionCfg
// });


// initialize whatsapp and the example event
client.initialize();
client.on('qr', (qr) => {
    // NOTE: This event will not be fired if a session is specified.
    console.log('QR Generate');
    qrcode_terminal.generate(qr, function (qrcode) {
        // console.log(qrcode);
    });    
    console.log('https://api.qrserver.com/v1/create-qr-code/?size=200x200&data='+qr);
    qrcode_terminal.generate(qr, {small: true});
});
client.on('authenticated', (session) => {
    console.log('AUTHENTICATED',session);
});
// client.on('authenticated', (session) => {
//     console.log('AUTHENTICATED', session);
//     sessionCfg=session;
//     fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), (err) => {
//         if (err) {
//             console.error(err);
//         }
//     });
// });
client.on('auth_failure', msg => {
    // Fired if session restore was unsuccessful
    console.error('AUTHENTICATION FAILURE', msg);
});

client.on('ready', () => {
    console.log('READY');
    // client.sendMessage("6281225518118@c.us", "hello");
});
client.on('message', async (msg) => {
    // console.log('MESSAGE RECEIVED', msg);

    if (msg.body === 'ping') {
        // Send a new message as a reply to the current one
        await client.sendMessage(msg.from,'🖥️ Device is connected');
    } else if (msg.body === '!ping') {
        // Send a new message as a reply to the current one
        await msg.reply('pong');
    } else{
        // function removeString(inputString) { 
        //     return inputString.replace(/[^0-9]/g, ''); 
        // }        
        // const chat_Model = require('./src/models/chat_model');
        // const chatModel = new chat_Model();
        // var number = removeString(msg.to);
        // console.log(number, msg.body);
        // chatModel.callChatProcedure([number,msg.body]).then((result) => {
        //     console.log('DEVICE SP: ', JSON.stringify(result[0]));
        //     var textList = [];
        //     var textResult = '';
        //     result.forEach(async (v,i) => {
        //         textList.push({text:v['chat_text']});
        //         textResult = v['chat_text'];
        //     })              
        //     if(textResult.length > 0){       
        //         client.sendMessage(msg.from, textResult);
        //         console.log(textResult);  
        //     }else{
        //         console.log('Autoreply not send');
        //     }                       
        //     // returnJson(res, 1, 'Success', result[0]);           
        // }).catch((error) => {
        //     console.error('Error retrieving device:', error.sqlMessage);
        //     // returnJson(res, 0, error.sqlMessage);                                             
        // });   
        console.log('Message from '+msg.from);    
    }    
});
client.on('disconnected', (reason) => {
    console.log('Client was logged out', reason);
});

// Socket Connection
/*
var today = new Date();
var now = today.toLocaleString();
io.on('connection', (socket) => {
    console.log('Socket Connected');
    socket.emit('message', `${now} Connected`);

    client.on('qr', (qr) => {
        console.log('QR Received');        
        qrcode.toDataURL(qr, (err, url) => {
            socket.emit("qr", url);
            socket.emit('message', `${now} QR Code received`);
        });
    });

    client.on('ready', () => {
        console.log('WhatsApp is ready');        
        socket.emit('message', `${now} WhatsApp is ready!`);
    });

    // client.on('authenticated', (session) => {
    //     console.log('Authenticating');
    //     socket.emit('message', `${now} Whatsapp is authenticated!`);
    //     sessionCfg = session;
    //     fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), function (err) {
    //         if (err) {
    //             console.error(err);
    //         }
    //     });
    // });
    client.on('authenticated', () => {
        console.log('AUTHENTICATED');
    });
    client.on('auth_failure', function (session) {
        console.log('Authentication Failure');
        socket.emit('message', `${now} Auth failure, restarting...`);
    });

    client.on('disconnected', function () {
        console.log('Disconected');
        socket.emit('message', `${now} Disconnected`);
        if (fs.existsSync(SESSION_FILE_PATH)) {
            fs.unlinkSync(SESSION_FILE_PATH, function (err) {
                if (err)
                    return console.log(err);
                console.log('Session file deleted!');
            });
            client.destroy();
            client.initialize();
        }
    });
});
*/
// send message routing

app.get('/devices', (req, res) => {
    res.setHeader('Content-Type', 'application/json')

    let body = req.query
    // let body = req.body
    let action = body.action
    let auth = body.auth
    let sender = body.sender
    let recipient= body.recipient
    let content = body.content
    let attach = body.file    
    let paramsDevice = {}

    // https://medium.com/@devharipragaz007/simplifying-mysql-operations-in-node-js-with-a-custom-extendable-class-d77623dab710
               
    console.log("Node: Body => "+JSON.stringify(body));
    if(req.query.action == '' || req.query.action === undefined){ 
        returnJson(res, 0, 'Action Not Found');   
    }else{       
        switch(action){
            case "new": //Not Used, Sample
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
                client.on('message', async (msg) => {
                    // console.log('MESSAGE RECEIVED', msg);
                
                    if (msg.body === '!ping reply') {
                        // Send a new message as a reply to the current one
                        await msg.reply('pong');
                
                    } else if (msg.body === '!ping') {
                        // Send a new message to the same chat
                        await client.sendMessage(msg.from, 'pong');
                
                    } 
                });
                client.on('disconnected', (reason) => {
                    console.log('Client was logged out', reason);
                });
                break;
            case "send-message": //wa
                // const client = new Client({
                //     authStrategy: new LocalAuth(),
                //     // proxyAuthentication: { username: 'username', password: 'password' },
                //     puppeteer: { 
                //         // args: ['--proxy-server=proxy-server-that-requires-authentication.example.com'],
                //         args:['--no-sandbox'],
                //         headless: true
                //     }
                // });            
                // client.initialize();
                // if(!(body.recipient) === undefined){
                    console.log("Recipient: "+recipient);
                    console.log("Node: "+content);
                    // client.sendMessage(recipient+'@c.us', content)
                    var rc = recipient+"@c.us";

                    // if(attach.length > 0){
                        // content = MessageMedia.fromUrl(attach);
                    // }
                    // console.log(attach.length);
                    client.sendMessage(rc, content)
                    .then(response => {
                        res.status(200).json({
                            status: 1,
                            message: 'Message Sent;',
                            result: response,
                        });
                        console.log('Sent to : '+recipient);
                    })
                    .catch(error => {
                        res.status(200).json({
                            status: 0,
                            message: 'Message Not Sent;',
                            result: error,
                        });
                        console.log('Not Sent to : '+recipient);
                    });   
                // }else{
                //     res.status(200).json({
                //         status: 0,
                //         message: 'Receipient not defined'
                //     });          
                // }
                break;
            case "load": //Not Used, Sample
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
            case "send": //Not Used, Sample
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
            case "helper1": //Not Used, Sample
                var a = myAsyncFunction();
                console.log(a);
                break;
            case "create": //Works with model
                // http://localhost:3030/devices?action=create&device_label=SS&device_number=8679789
                paramsDevice = {
                    device_label: body.device_label,
                    device_number: body.device_number
                };
                deviceModel.create(paramsDevice).then((insertId) => {
                    console.log('DEVICE CREATE: device_id => ', insertId);
                    returnJson(res, 1, 'Success Created device_id => '+ insertId);                                     
                }).catch((error) => {
                    console.error('Error retrieving device:', error.sqlMessage);
                    returnJson(res, 0, error.sqlMessage);                                             
                });
            break;                  
            case "read": //Works with model
                // http://localhost:3030/devices?action=read&device_id=1
                deviceModel.findById(body.device_id).then((result) => {
                    let deviceData = {
                        device_id: result.device_id,
                        device_number: result.device_number,
                        device_auth: result.device_auth,
                        device_qr: qrcodeApi + result.device_number
                    }
                    console.log('DEVICE READ: ', JSON.stringify(deviceData));
                    returnJson(res, 1, 'Read '+body.device_id, deviceData);    
                }).catch((error) => {
                    console.error('Error retrieving user:', error);
                    returnJson(res, 0, error.sqlMessage);    
                });
                break;
            case "update": //Works with model
                // http://localhost:3030/devices?action=update&device_id=1&device_label=JOE
                paramsDevice = {
                    device_label: body.device_label,
                };
                deviceModel.update(body.device_id, paramsDevice).then((affectedRows) => {
                    console.log('DEVICE UPDATE: ', body.device_id);
                    returnJson(res, 1, 'Success Update '+body.device_id);                                     
                }).catch((error) => {
                    console.error('Error retrieving device:', error.sqlMessage);
                    returnJson(res, 0, error.sqlMessage);                                             
                });
            case "delete": //Works with model
                // http://localhost:3030/devices?action=delete&device_id=99
                deviceModel.delete(body.device_id).then((affectedRows) => {
                    console.log('DEVICE DELETE: ', body.device_id);
                    returnJson(res, 1, 'Deleted '+body.device_id);                                     
                }).catch((error) => {
                    console.error('Error retrieving device:', error.sqlMessage);
                    returnJson(res, 0, error.sqlMessage);                                             
                });                
            break;                            
            default:
                returnJson(res, 0, 'Nothing to do');        
                break;
        }
    }
});

module.exports = app;
// module.exports = client, LocalAuth;
