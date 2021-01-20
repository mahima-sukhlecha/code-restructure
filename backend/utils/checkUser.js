require('dotenv').config();
var sql = require("mssql");
var jwt_decode = require('jwt-decode');

//Check user whether he is globalAdmin or not. (Only global admin can access dashbaord)
exports.checkUser = async(req,res)=>{
    try {
        var a3s_id= req.headers.id
        var name = (jwt_decode(req.headers.authorization)).unique_name;
        new Promise((resolve)=>{
            var request = new sql.Request();
            //Checking user a3sId and emailId have globalAdmin designation or not.
            request.query(`SELECT emailId,designation FROM [insights].[userInfo] WHERE a3sId ='${a3s_id}' AND emailId ='${name}'`, async function (error, recordset){
                if(error){
                    console.log('Error occurred: ',error)
                    res.statusCode = 400
                    res.send({"status": "Error occurred..!!"})
                }else {
                    if(recordset.recordset.length >0){
                        res.send((recordset.recordset)[0])
                    }else{
                        res.statusCode = 401
                        res.send({ "status": "You don't have an access" }) }                
                }
            })
        }) 
    } catch(error) {
        console.log(error)
        res.status(404).send({"status": "Error occurred..!!! Please try again."}) 
    }  
}