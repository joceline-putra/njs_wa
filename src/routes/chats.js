const { Router } 	= require('express'); 
const app			= Router(); 
const {myAsyncFunction, myAsyncFunction2, returnJson}        = require("./../helper.js");

var cn          	= require("../config/database");
const chat_Model = require('../models/chat_model');
const chatModel = new chat_Model();

app.get('/chats', (req, res) => {
    res.setHeader('Content-Type', 'application/json')
        
    let body = req.query
    let action = body.action
    let number = body.number
    let term = body.term
    console.log("Node: Body => "+JSON.stringify(body));
    if(req.query.action == '' || req.query.action === undefined){   
        returnJson(res, 0, 'Action Not Found');   
    }else{ 
        switch(action){
            case "chat":
                chatModel.callChatProcedure([number,term]).then((result) => {
                    console.log('DEVICE SP: ', JSON.stringify(result[0]));
                    var textList = [];
                    var textResult = '';
                    result.forEach(async (v,i) => {
                        textList.push({text:v['chat_text']});
                        textResult = v['chat_text'];
                    })                     
                    console.log(textResult);                         
                    returnJson(res, 1, 'Success', result[0]);           
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
})

module.exports = app;