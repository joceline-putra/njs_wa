const { Router } 	= require('express'); 
const app			= Router(); 
const helper        = require("./../helper.js");

var cn          	= require("../config/database");

app.get('/messages', (req, res) => {
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
            case "load":
                // http://localhost:8000/devices?action=load-user&order=user_id&start=0&limit=10&dir=asc
				var order = body.order;
				var limit = body.limit;
				if(!(body["order"] === undefined)){ order = " ORDER BY `" + body["order"] + "` " + body["dir"].toUpperCase(); }else{ order = '';  }
				if(!(body["limit"] === undefined)){ limit = " LIMIT " + body["start"] + "," + body["limit"]; }else{ limit = ' LIMIT 0,10'; }
				
				var sql = "SELECT * FROM `messages`" + order + "" + limit;
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
            case "create":
                break;
            case "delete":
                break;        
            case "chat":
                var number = body.number;
                var term = body.term;
				var sql = "CALL sp_chat_return(?,?)";                
				// console.log("Node: Query => " + sql);
				var query = cn.query(sql, [number, term], (err, results) => {
					if (!err) {
                        console.log(JSON.parse(JSON.stringify(results[0])));
                        var textList = [];
                        var textResult = '';
                        results[0].forEach(async (v,i) => {
                            textList.push({text:v['chat_text']});
                            textResult = v['chat_text'];
                        })
                        console.log(textList);
                        console.log(textResult);                        

                        res.status(200).json({
                            status: 1,
                            message: 'Message Sent;',
                            result: results[0],
                            total_records: results[0].length
                        });                          
                        // console.log('Node: Works');  
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

module.exports = app;