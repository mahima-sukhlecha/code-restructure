require('dotenv').config();
var request = require('request');
var sql = require("mssql");
var format = require('pg-format');

//Insert scheduling data into database
async function insertData(req,res){
    try {
        var reqData = req.body
        var a3sId = req.headers.id
        var userId = req.headers.userid
        var scope = req.headers.scope
        new Promise((resolve,reject)=>{
            var request = new sql.Request();
            var query = `INSERT INTO dbo.schedules VALUES ('${a3sId}','${userId}','${scope}','${reqData.scheduleName}','${reqData.scheduleDescription}','${reqData.startDate}','${reqData.endDate}','${reqData.Recurrence}','${reqData.startTime}','start'),('${a3sId}','${userId}','${scope}','${reqData.scheduleName}','${reqData.scheduleDescription}','${reqData.startDate}','${reqData.endDate}','${reqData.Recurrence}','${reqData.stopTime}','stop')`
            request.query(query, async function (err, recordset) {
                if(err) {
                    reject(err)
                }else{   
                    resolve(recordset.recordset)  }
            })
        }).then(result=>{
            res.send("Data successfully inserted in Database..!!!")
        }).catch(error=>{
            console.log("Error occurred: ",error)
            res.status(400).send({"Error":error})
        })
    }catch(error) {
        console.log(error)
        res.status(404).send({"status": "Error occurred..!!! Please try again."})
    }  
}

//Get scheduling data from database based on a3sID
async function fetchData(req,res){
    try {
        var a3sId = req.headers.id
        new Promise((resolve,reject)=>{
            var request = new sql.Request();
            var query = `SELECT * FROM dbo.schedules where a3sId='${a3sId}'`
            request.query(query, async function (err, recordset) {
                if(err) {
                    reject(err)
                }else{   
                    resolve(recordset.recordset)  }
            })
        }).then(result=>{
            res.send(result)
        }).catch(error=>{
            console.log("Error occurred: ",error)
            res.status(400).send({"Error":error})
        })
    }catch(error) {
        console.log(error)
        res.status(404).send({"status": "Error occurred..!!! Please try again."})
    }  
}

//Update scope value of given key in database
async function updateData(req,res){
    try {
        var key = req.params["key"]
        var scope = req.query["scope"]
        new Promise((resolve,reject)=>{
            var request = new sql.Request();
            var query = `UPDATE dbo.schedules SET scope='${scope}' WHERE uKey='${key}'`
            request.query(query, async function (err, recordset) {
                if(err) {
                    reject(err)
                }else{   
                    resolve(recordset.recordset)  }
            })
        }).then(result=>{
            res.send("Data updated successfully..!!!")
        }).catch(error=>{
            console.log("Error occurred: ",error)
            res.status(400).send({"Error":error})
        })
    }catch(error) {
        console.log(error)
        res.status(404).send({"status": "Error occurred..!!! Please try again."})
    }  
}

//Delete row with given key from database
async function deleteData(req,res){
    try {
        var key = req.params.key
        new Promise((resolve,reject)=>{
            var request = new sql.Request();
            var query = `DELETE FROM dbo.schedules WHERE uKey='${key}'`
            request.query(query, async function (err, recordset) {
                if(err) {
                    reject(err)
                }else{   
                    resolve(recordset.recordset)  }
            })
        }).then(result=>{
            res.send("Data deleted successfully..!!!")
        }).catch(error=>{
            console.log("Error occurred: ",error)
            res.status(400).send({"Error":error})
        })
    }catch(error) {
        console.log(error)
        res.status(404).send({"status": "Error occurred..!!! Please try again."})
    }  
}


module.exports = {insertData, fetchData, updateData ,deleteData}