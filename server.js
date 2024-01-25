require('dotenv/config')
const {Client, LocalAuth} = require('whatsapp-web.js');
const fs                  = require('fs');
const express             = require('express');
const qrcode           = require('qrcode');
const qrcode_terminal  = require('qrcode-terminal');
// const socketIO      = require('socket.io');
const http             = require('http');

const cn               = require("./src/config/database");
const {myAsyncFunction, myAsyncFunction2, returnJson, removeStringSender}        = require("./src/helper.js");

// Router
var deviceRouter    = require("./src/routes/devices");
var messageRouter   = require("./src/routes/messages");
var chatRouter   = require("./src/routes/chats");

// file config
const SESSION_FILE_PATH = './wtf-session.json';
let sessionCfg;
if (fs.existsSync(SESSION_FILE_PATH)) {
    sessionCfg = require(SESSION_FILE_PATH);
}

// initial instance
const PORT = process.env.APP_PORT || 3000;
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
        // args: ['--proxy-server=proxy-server-that-requires-authentication.example.com'],
        args:['--no-sandbox'],
        headless: true
    }
});

// Index Routing and Middleware
app.use(deviceRouter);
app.use(messageRouter);
app.use(chatRouter);

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.get('/', (req, res) => {
    res.sendFile('index.html', {root: __dirname});
});

// initialize whatsapp and the example event
client.initialize();
// client.on('qr', (qr) => {
//     // NOTE: This event will not be fired if a session is specified.
//     console.log('QR Generate');
//     console.log('https://api.qrserver.com/v1/create-qr-code/?size=200x200&data='+qr);
//     // qrcode_terminal.generate(qr, function (qrcode) {
//     //     console.log(qrcode);
//     // });    
//     qrcode_terminal.generate(qr, {small: true});
// });
client.on('authenticated', () => {
    console.log('AUTHENTICATED');
});
// client.on('auth_failure', msg => {
//     // Fired if session restore was unsuccessful
//     console.error('AUTHENTICATION FAILURE', msg);
// });

client.on('ready', () => {
    console.log('READY');
    // client.sendMessage("6281225518118@c.us", "hello");
});
client.on('message', async msg => {
    // console.log('MESSAGE RECEIVED', msg);

    if (msg.body === 'ping') {
        // Send a new message as a reply to the current one
        client.sendMessage(msg.from,'🖥️ Device is connected');
    } else if (msg.body === '!ping') {
        // Send a new message as a reply to the current one
        msg.reply('pong');
    } else{
        function removeString(inputString) { 
            return inputString.replace(/[^0-9]/g, ''); 
        }        
        const chat_Model = require('./src/models/chat_model');
        const chatModel = new chat_Model();
        var number = removeString(msg.to);
        console.log(number, msg.body);
        chatModel.callChatProcedure([number,msg.body]).then((result) => {
            console.log('DEVICE SP: ', JSON.stringify(result[0]));
            var textList = [];
            var textResult = '';
            result.forEach(async (v,i) => {
                textList.push({text:v['chat_text']});
                textResult = v['chat_text'];
            })              
            if(textResult.length > 0){       
                client.sendMessage(msg.from, textResult);
                console.log(textResult);  
            }else{
                console.log('Autoreply not send');
            }                       
            // returnJson(res, 1, 'Success', result[0]);           
        }).catch((error) => {
            console.error('Error retrieving device:', error.sqlMessage);
            // returnJson(res, 0, error.sqlMessage);                                             
        });       
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

app.get('/send', (req, res) => { //Not Used
    const phone = req.body.phone;
    const message = req.body.message;
    // console.log(req,res);
    // client.sendMessage(phone, message)
    client.sendMessage('6281225518118@c.us', '/Send API Success')
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

// Server Listening
server.listen(PORT, () => {
    console.log('App listen on port ', PORT);
});


module.exports = app;

