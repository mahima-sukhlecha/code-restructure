require('dotenv').config();
var sql = require("mssql");
var jwt_decode = require('jwt-decode');

async function deleteLogoutDataFromDatabase(email){
    try{
        return new Promise((resolve,reject)=>{
            var request = new sql.Request();
            var query = `DELETE FROM [PowerBI].[Requestbuffer] WHERE email='${email}'`
            request.query(query, async function (err, recordset) {
                if(err) {
                    reject(err)
                }else{   
                    resolve({"status":"Deleted successfully..!!!"}) }
            })
        })
    }catch(error) {
        console.log(error)
        res.status(404).send({"status": "Error occurred..!!! Please try again."})
    }  
}

exports.logout = async(req,res)=> {
    try {
        var a3sId = req.headers.id
        var email = (jwt_decode(req.headers.authorization)).unique_name;
        if(a3sId===email){
            await deleteLogoutDataFromDatabase(email).then(result=>{
                res.send(result)
            }).catch(error=>{
                console.log("Error occurred: ",error)
                res.status(400).send(error)
            })
        }else{
            res.status(401).send({"Error":"Invalid credentails"}) }        
    }catch(error) {
        console.log(error)
        res.status(404).send({"status": "Error occurred..!!! Please try again."})
    }  
}