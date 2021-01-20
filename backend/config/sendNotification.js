require('dotenv').config();
var request = require('request');
var sql = require("mssql");
var async = require('async');
//Fetch User's assigned URL from Database for sending Notification to url of either Teams or Slack channel
async function getURLForSendingNotification(a3sId,channel) {
    return new Promise((resolve,reject)=>{
        try{
            var request = new sql.Request();
            var query = `SELECT URL FROM dbo.assignedURLs WHERE a3sId='${a3sId}' and channel='${channel}'`
            request.query(query, async function (err, recordset) {
                if(err) {
                    console.log("Error occurred: ",err)
                    reject({"Error":err})
                }else{   
                    resolve(recordset.recordset) }
            })
        }catch(error) {
            console.log(error)
            reject({"Error": "In try catch"})
        }          
    })
}

//Insert User's Activity log into Database
async function insertActivityLogsIntoDatabase(reqData,a3sId) {
    return new Promise((resolve,reject)=>{
        try{
            var request = new sql.Request();
            var query = `INSERT INTO [dbo].[activitylog] VALUES ('${reqData.Email}','${reqData.Name}','${reqData.MessageDate}','${reqData.MessageTime}','${reqData.Message}','${a3sId}')`
            request.query(query, async function (err, recordset) {
                if(err) {
                    console.log("Error occurred while inserting activity logs into database: ",err)
                    reject({"Error":err})
                }else{   
                    resolve({"Success":"URL successfully inserted into database..!!!"})  }
            })
        }catch(error) {
            console.log(error)
            reject({"Error": "In try catch"})
        }          
    })
}

//Send Notification to "TEAMS" channel
async function sendNotificationMessageTeams(a3sId,message){
    return new Promise(async (resolve,reject)=>{
        try{
            await getURLForSendingNotification(a3sId,'Teams').then(teamsUrl=>{
                if(teamsUrl.length>0){
                    var options = {
                        'method': 'POST',
                        'url': `${teamsUrl[0].URL}`,
                        body: {"text":(message)},
                        json: true
                    }
                    console.log('Teams--> Options',options)
                    request(options, async function (error, response) { 
                        if (!error && response.statusCode === 200){
                            resolve(JSON.parse(response.body))
                        }else if(error){
                            console.log("Error occurred: ",error)
                            reject({"Error":error})
                        }else{
                            console.log("Error occurred: ",response.body)
                            reject({"Error":response.body})    }
                    });
                }else{
                    resolve('')
                }
            }).catch(error=>{
                reject(error)
            })            
        }catch(error) {
            console.log(error)
            reject({"Error": "In try-catch"})
        }   
    })    	
}

//Send Notification to "SLACK" channel
async function sendNotificationMessageSlack(a3sId,message){
    return new Promise(async (resolve,reject)=>{
        try{
            await getURLForSendingNotification(a3sId,'Slack').then(slackUrl=>{
                if(slackUrl.length>0){
                    var options = {
                        'method': 'POST',
                        'url': `${slackUrl[0].URL}`,
                        body: {"text":(message)},
                        json: true
                    }
                    console.log('Slack--> Options',options)
                    request(options, async function (error, response) { 
                        if (!error && response.statusCode === 200){
                            resolve(JSON.parse(response.body))
                        }else if(error){
                            console.log("Error occurred: ",error)
                            reject({"Error":error})
                        }else{
                            console.log("Error occurred: ",response.body)
                            reject({"Error":response.body})    }
                    });
                }else{
                    resolve('')
                }     
            }).catch(error=>{
                reject(error)
            })            
        }catch(error) {
            console.log(error)
            reject({"Error": "In try-catch"})
        }   
    })    	
	
}

exports.SendNotification = async(req,res)=> {
    new Promise(async (resolve,reject)=>{
        try{
            var a3sId = req.headers['id']
            var reqData = req.body
            await insertActivityLogsIntoDatabase(reqData,a3sId).then(async result1=>{
                await sendNotificationMessageTeams(a3sId,reqData.Message).then(async result2=>{
                    await sendNotificationMessageSlack(a3sId,reqData.Message).then(result3=>{
                        resolve("Success")
                    }).catch(error=>{
                        console.log("Error occurred while sending notification to Slack: ")
                        reject(error)
                    })
                }).catch(error=>{
                    console.log("Error occurred while sending notification to Teams: ")
                    reject(error)
                 }) 
            }).catch(error=>{
                reject(error)
            })            
        }catch(error) {
            console.log(error)
            reject({"Error": "In try-catch"})
        }
    }).then(result=>{
        res.send({"Success":"Notified Successfully...!!!"})
    }).catch(error=>{
        res.status(400).send({"Error":error})
    })
}