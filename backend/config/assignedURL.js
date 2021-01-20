require('dotenv').config();
var sql = require("mssql");


//Insert User's assigned URL into Database
exports.insertAssignedURLIntoDatabase = async(req,res) => {
    new Promise((resolve,reject)=>{
        try{
            var a3sId = req.headers['id']
            var reqData = req.body
            var request = new sql.Request();
            var query = `INSERT INTO dbo.assignedURLs VALUES ('${a3sId}','${reqData.url}','${reqData.channel}',${reqData.index})`  //index is 'int' type
            request.query(query, async function (err, recordset) {
                if(err) {
                    console.log("Error occurred: ",err)
                    reject({"Error":err})
                }else{   
                    resolve({"Success":"URL successfully inserted into database..!!!"})  }
            })
        }catch(error) {
            console.log(error)
            reject({"Error": "In try catch"})
        }          
    }).then(result=>{
        res.send(result)
    }).catch(error=>{
        res.status(400).send(error)
    })
}


//Delete User's assigned URL from Database
exports.deleteAssignedURLFromDatabase = async(req,res) => {
    new Promise((resolve,reject)=>{
        try{
            var a3sId = req.headers['id']
            var reqData = req.body
            var request = new sql.Request();
            var query = `DELETE FROM dbo.assignedURLs WHERE a3sId='${a3sId}' AND URL='${reqData.url}'`
            request.query(query, async function (err, recordset) {
                if(err) {
                    console.log("Error occurred: ",err)
                    reject({"Error":err})
                }else{   
                    resolve({"Success":"URL successfully deleted from database..!!!"})  }
            })
        }catch(error) {
            console.log(error)
            reject({"Error": "In try catch"})
        }          
    }).then(result=>{
        res.send(result)
    }).catch(error=>{
        res.status(400).send(error)
    })
}


//Fetch User's assigned URL from Database
async function fetchAssignedURL(a3sId,channel){
    return new Promise((resolve,reject)=>{
        try{
            var request = new sql.Request();
            var query = `SELECT URL FROM dbo.assignedURLs WHERE a3sId='${a3sId}' AND channel='${channel}'`
            request.query(query, async function (err, recordset) {
                if(err) {
                    console.log("Error occurred: ",err)
                    reject({"Error":err})
                }else{   
                    resolve(recordset.recordset)  }
            })
        }catch(error) {
            console.log(error)
            reject({"Error": "In try catch"})
        }          
    })
}

//Fetch User's assigned URL from Database
exports.fetchAssignedURLFromDatabase = async(req,res) => {
    var urlData={}
    new Promise(async (resolve,reject)=>{
        try{
            var a3sId = req.headers['id']
            await fetchAssignedURL(a3sId,'Teams').then(async result=>{
                urlData['Teams']= result
                await fetchAssignedURL(a3sId,'Slack').then(re=>{
                    urlData['Slack'] = re
                    resolve(urlData)
                })
            }).catch(error=>{
                reject(error)
            })
        }catch(error) {
            console.log(error)
            reject({"Error": "In try catch"})
        }          
    }).then(result=>{
        res.send(urlData)
    }).catch(error=>{
        res.status(400).send(error)
    })
}