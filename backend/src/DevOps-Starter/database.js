require('dotenv').config();
var sql = require("mssql");

async function database(query){
    return new Promise((resolve,reject)=>{
        try{
            var request = new sql.Request();
            request.query(query, async function (err, recordset) {
                if(err) {
                    console.log("Error: ",err)
                    reject(err)
                }else{   
                    resolve(recordset.recordset) }
            })
        }catch(error) { //Error occurred in try-catch
            console.log("Database Error :",error)
            reject({"status": "Error occurred..!!! Please try again."})
        }          
    })    
}

module.exports = { database }
