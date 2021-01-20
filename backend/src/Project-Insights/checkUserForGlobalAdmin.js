require('dotenv').config();
var sql = require("mssql");
var jwt_decode = require('jwt-decode');

//Check user whether he is globalAdmin or not. (Only global admin can access dashbaord)
exports.checkUser = async(req)=>{
    try {
        var a3s_id= req.headers.id
        var name = (jwt_decode(req.headers.authorization)).unique_name;
        
        return new Promise((resolve,reject)=>{
            var request = new sql.Request();
            //Checking user a3sId and emailId have globalAdmin designation or not.
            request.query(`SELECT emailId,designation FROM [insights].[userInfo] WHERE a3sId ='${a3s_id}' AND emailId ='${name}'`, async function (error, recordset){
                if(error){
                    reject({"status": "Error occurred..!!"})
                }else {
                    if(recordset.recordset.length >0 && ((recordset.recordset)[0]).designation==='globalAdmin'){
                        resolve((recordset.recordset)[0])
                    }else{
                        reject({ "status": "You don't have an access" }) }                
                }
            })
        }) 
    } catch(error) { //Error occurred in try-catch block
        console.log(error)
        reject({"status": "Error occurred..!!! Please try again."}) 
    }  
}