require('dotenv').config();
var request = require('request');
var sql = require("mssql");
var jwt_decode = require('jwt-decode');
const {checkUser} = require('./checkUserForGlobalAdmin')

//Check if the User already exist into Database as GUEST.
async function checkUserInDatabase(a3sId,mailID) {
    try {
        var role= 'Guest'  //Designation
        return new Promise((resolve,reject)=>{
            var request = new sql.Request();
            var query = `SELECT * FROM insights.userInfo WHERE emailId='${mailID}' AND designation='${role}' AND a3sId='${a3sId}'`
            request.query(query, async function (err, recordset) {
                if(err) {
                    reject(err)
                }else{   
                    resolve(recordset.recordset)  }
            })
        })
    }catch(error) { //Error occurred in try-catch block
        console.log(error)
        res.status(404).send({"status": "Error occurred..!!! Please try again."})
    }  
}
//Add User into Database as GUEST
async function addUser(req,res) {
    try {
        await checkUser(req).then(async validate=>{
            var reqData = req.body
            var a3sId = req.headers.id
            var role= 'Guest'  //designation
            await checkUserInDatabase(a3sId,reqData.name).then(output=> {
                if(output.length>0){
                    res.status(400).send({"status":"The user with the same mailId has already been added. Please retry..!!!"})
                }else{
                    new Promise((resolve,reject)=>{
                        var request = new sql.Request();
                        var query = `INSERT INTO [insights].[userInfo] VALUES ('${reqData.name}','${role}','${a3sId}')`
                        request.query(query, async function (err, recordset) {
                            if(err) { 
                                reject(err)
                            } else{   
                                resolve(recordset.recordset) }
                        })
                    }).then(result=> {
                        res.send({"status": "Data Successfully Inserted in Database..!!!"})
                    }).catch(error =>{ //Error occurred while inserting data into database
                        console.log('Error occurred: ',error)
                        res.status(400).send({"status": error})
                    })
                }
            }).catch(error =>{ //Error occurred in checkUserInDatabase
                console.log('Error occurred: ',error)
                res.status(400).send({"DB Error": error})
            })
        }).catch(error=>{ //Error occurred in checkUser
            res.status(401).send(error)
        }) 
    } catch(error) { //Error occurred in try-catch block
        res.status(404).send({"status": "Error occurred..!!! Please try again."})
        console.log(error)
    }    
}

//Delete User from Database.
async function deleteUser(req,res) {
    try {
        await checkUser(req).then(validate=>{
            var reqData = req.body
            var a3sId = req.headers.id

            new Promise((resolve,reject)=>{
                var request = new sql.Request();
                var query = `DELETE FROM [insights].[userInfo] WHERE a3sId ='${a3sId}' AND emailId ='${reqData.name}'`
                request.query(query, async function (err, recordset) {
                    if(err) {
                        reject(err)
                    } else{   
                        resolve(recordset.recordset) }
                })
            }).then(result=> {
                res.send({"status": "Data successfully Deleted from Database..!!!"})
            }).catch(error =>{ //Error occurred while deleting data from database
                console.log('Error occurred: ',error)
                res.status(400).send({"status": "Error occurred..!!!"})
            })
            
        }).catch(error=>{ //Error occurred in checkUser
            res.status(401).send(error)
        }) 
    } catch(error) { //Error occurred in try-catch block
        console.log(error)
        res.status(404).send({"status": "Error occurred..!!! Please try again."})
    }    
}

//Get GUEST Users from Database.
async function getUser(req,res) {
    try {
        await checkUser(req).then(validate=>{

            new Promise((resolve,reject)=>{
                var a3sId = req.headers.id
                var role= 'Guest'  
                var request = new sql.Request();
                var query = `SELECT * FROM [insights].[userInfo] WHERE a3sId='${a3sId}' AND designation='${role}'`
                request.query(query, async function (err, recordset) {
                    if(err) {
                        reject(err)
                    } else{   
                        resolve(recordset.recordset) }
                })
            }).then(result=> {
                res.send(result)
            }).catch(error =>{ //Error occurred while querying data from database
                console.log('Error occurred: ',error)
                res.status(400).send({"status": "Error occurred..!!!"})
            })

        }).catch(error=>{ //Error occurred in checkUser
            res.status(401).send(error)
        }) 
    } catch(error) { //Error occurred in try-catch block
        console.log(error)
        res.status(404).send({"status": "Error occurred..!!! Please try again."})
    }    
}

module.exports = {addUser, deleteUser, getUser}