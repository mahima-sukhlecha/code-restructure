require('dotenv').config();
var request = require('request');
var sql = require("mssql");
var format = require('pg-format');

//Insert applied Schedules data into database
async function insertAppliedSchedules(req,res){
    try {
        var reqData = req.body
        var a3sId = req.headers.id
        var userId = req.headers.userid
        var scope = req.headers.scope
        const month= {"Jan":"01","Feb":"02","Mar":"03","Apr":"04","May":"05","Jun":"06","Jul":"07","Aug":"08","Sep":"09","Oct":"10","Nov":"11","Dec":"12"}

        var startDateObj = new Date(reqData.StartDate);
        var utc_startDateObj = startDateObj.toUTCString()  //Sat, 19 Sep 2020 03:30:00 GMT
        var sList = utc_startDateObj.split(" ")
        var startDate=`${sList[3]}-${month[sList[2]]}-${sList[1]}`  //2020-09-19
        var startTime= sList[4] //3:30:00

        var endDateObj = new Date(reqData.StopDate);
        var utc_endDateObj = endDateObj.toUTCString()
        var eList = utc_endDateObj.split(" ")
        var endDate=`${eList[3]}-${month[eList[2]]}-${eList[1]}`
        var stopTime= eList[4]     
        new Promise((resolve,reject)=>{
            var request = new sql.Request();
            var query =  `INSERT INTO [dbo].[schedules] VALUES ('${a3sId}','${userId}','${scope}','${reqData.scheduleName}','${reqData.Description}','${startDate}','${endDate}','${reqData.Recurrence}','${startTime}','Start'),('${a3sId}','${userId}','${scope}','${reqData.scheduleName}','${reqData.Description}','${startDate}','${endDate}','${reqData.Recurrence}','${stopTime}','Stop')`
            request.query(query, async function (err, recordset) {
                if(err) {
                    reject(err)
                }else{   
                    resolve(recordset.recordset)  }
            })
        }).then(result=>{
            res.send({"status":"Data successfully inserted in Database...!!"})
        }).catch(error=>{
            console.log("Error occurred: ",error)
            res.status(400).send({"Error":error})
        })
    }catch(error) {
        console.log(error)
        res.status(404).send({"status": "Error occurred..!!! Please try again."})
    }  
}

//Insert Global schedules data into database
async function insertGlobalSchedules(req,res){
    try {
        var reqData = req.body
        var a3sId = req.headers.id
        new Promise((resolve,reject)=>{
            var request = new sql.Request();
            var query = `INSERT INTO [dbo].[globalSchedules] VALUES ('${a3sId}','${reqData.scheduleName}','${reqData.Description}','${reqData.StartDate}','${reqData.StopDate}','${reqData.Recurrence}','${reqData.timezone}')`
            request.query(query, async function (err, recordset) {
                if(err) {
                    reject(err)
                }else{   
                    resolve(recordset.recordset)  }
            })
        }).then(result=>{
            res.send({"status":"Data successfully inserted in Database..!!!"})
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
            var query = `SELECT DISTINCT test.scope, test.scheduleName, demo.sDescription, demo.startDate, 
                            demo.stopDate, demo.recurrence, demo.timeZone FROM [dbo].[globalSchedules] demo
                             INNER JOIN [dbo].[schedules] test ON demo.scheduleName = test.scheduleName 
                              WHERE demo.a3sId='${a3sId}'`
            request.query(query, async function (err, recordset) {
                if(err) {
                    reject(err)
                }else{   
                    resolve(recordset.recordset)  }
            })
        }).then(result=>{
            var resultantData={}
            var scheduleList=[]
            result.forEach(el => {
                scheduleList.push(el.scheduleName) });
            const distinctscheduleList = [... new Set(scheduleList)]
            distinctscheduleList.forEach(element => {
                resultantData[element]={"Scopes":[]} 
            });
            result.forEach(element => {
                (resultantData[element.scheduleName].Scopes).push(element.scope)
                resultantData[element.scheduleName].Description = element.sDescription
                resultantData[element.scheduleName].StartDate = element.startDate  
                resultantData[element.scheduleName].StopDate = element.stopDate
                resultantData[element.scheduleName].Recurrence = element.recurrence
                resultantData[element.scheduleName].TimeZone = element.timeZone
            });
            res.send(resultantData)
        }).catch(error=>{
            console.log("Error occurred: ",error)
            res.status(400).send({"Error":error})
        })
    }catch(error) {
        console.log(error)
        res.status(404).send({"status": "Error occurred..!!! Please try again."})
    }  
}


//Delete schedule from Db on basis od scope,scheduleName,a3sId
async function deleteSchedules(req,res){
    try {
        var scope = req.query.scope
        var scheduleName = req.params.scheduleName
        var a3sId = req.header('id')
        new Promise((resolve,reject)=>{
            var request = new sql.Request();
            var query = `DELETE FROM [dbo].[schedules] WHERE scope='${scope}' AND scheduleName='${scheduleName}' AND a3sId = '${a3sId}'`
            request.query(query, async function (err, recordset) {
                if(err) {
                    reject(err)
                }else{   
                    resolve(recordset.recordset)  }
            })
        }).then(result=>{
            res.send({"status":"Data deleted successfully..!!!"})
        }).catch(error=>{
            console.log("Error occurred: ",error)
            res.status(400).send({"Error":error})
        })
    }catch(error) {
        console.log(error)
        res.status(404).send({"status": "Error occurred..!!! Please try again."})
    }  
}


module.exports = {insertAppliedSchedules,insertGlobalSchedules, fetchData, deleteSchedules}