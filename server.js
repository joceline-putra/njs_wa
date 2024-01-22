const {Client, LocalAuth} = require('whatsapp-web.js');
const fs        = require('fs');
const express   = require('express');
const qrcode    = require('qrcode');
var qrcode_terminal = require('qrcode-terminal');
// const socketIO  = require('socket.io');
const http      = require('http');
var cn          = require("./routes/db");

// file config
const SESSION_FILE_PATH = './wtf-session.json';
let sessionCfg;
if (fs.existsSync(SESSION_FILE_PATH)) {
    sessionCfg = require(SESSION_FILE_PATH);
}

// initial instance
const PORT = process.env.PORT || 3030;
const app = express();
const server = http.createServer(app);
// const io = socketIO(server);
// const client = new Client({
//   restartOnAuthFail: true,
//   puppeteer: {
//     headless: true,
//     args: [
//       '--no-sandbox',
//       '--disable-setuid-sandbox',
//       '--disable-dev-shm-usage',
//       '--disable-accelerated-2d-canvas',
//       '--no-first-run',
//       '--no-zygote',
//       '--single-process', // <- this one doesn't works in Windows
//       '--disable-gpu'
//     ],
//   },
//   session: sessionCfg
// });
// const client = new Client({
//     authStrategy: new LocalAuth()
// });
// const client = new Client();
const client = new Client({
    authStrategy: new LocalAuth(),
    // proxyAuthentication: { username: 'username', password: 'password' },
    puppeteer: { 
        args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process', // <- this one doesn't works in Windows
        '--disable-gpu'
        ],
        headless: false
    }
});

// index routing and middleware
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.get('/', (req, res) => {
    res.sendFile('index.html', {root: __dirname});
});

// initialize whatsapp and the example event
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
// socket connection
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
            case "new":
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
                if(!(body.recipient) === undefined){
                    client.sendMessage(recipient+'@c.us', content)
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
                            message: 'Message Sent;',
                            result: error,
                        });
                    });   
                }else{
                    res.status(200).json({
                        status: 0,
                        message: 'Receipient not defined'
                    });          
                }
                break;
            case "load-user":
                // http://localhost:8000/devices?action=load-user&order=user_id&start=0&limit=10&dir=asc
				var order = body.order;
				var limit = body.limit;
				if(!(body["order"] === undefined)){ order = " ORDER BY `" + body["order"] + "` " + body["dir"].toUpperCase(); }else{ order = '';  }
				if(!(body["limit"] === undefined)){ limit = " LIMIT " + body["start"] + "," + body["limit"]; }else{ limit = ' LIMIT 0,10'; }
				
				var sql = "SELECT * FROM `users`" + order + "" + limit;
				console.log("Node: Query => " + sql);
				var query = cn.query(sql, (err, results) => {
					if (!err) {
                        /* var json = JSON.parse(JSON.stringify(results)); */
                        res.status(200).json({
                            status: 1,
                            message: 'Message Sent;',
                            result: results,
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
            default:
                res.status(200).json({
                    status: 0,
                    message: 'Nothing to do',
                });                
                break;
        }
    }
});
app.get('/send', (req, res) => {
    const phone = req.body.phone;
    const message = req.body.message;
    // console.log(req,res);
    // client.sendMessage(phone, message)
    client.sendMessage('6281225518118@c.us', 'hio')
    .then(response => {
        res.status(200).json({
            error: false,
            data: {
                message: 'Pesan terkirim',
                meta: response,
            },
        });
    })
    .catch(error => {
        res.status(200).json({
            error: true,
            data: {
                message: 'Error send message',
                meta: error,
            },
        });
    });
});

server.listen(PORT, () => {
    console.log('App listen on port ', PORT);
});

