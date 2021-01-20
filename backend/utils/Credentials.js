var mssql = require("mssql");

const config = {
    user: process.env.user,
    password: process.env.password,
    server: process.env.server,
    database: process.env.database,
    encrypt: true,
    requestTimeout: 1500000
};
exports.getcredentials = async(id)=>{
    return new Promise ((resolve,reject)=>{
            // create Request object
        var request = new mssql.Request();
            // query to the database and get the records
        request.query(`select clientId,clientSecret,tenantId,globalAdmin from admin_auth.loginauth where a3sId = '${id}'`, function (err, recordset) {
                
        if (err){
            console.log("---->",err)
            reject({"Error":"Invalid User"})
        }else if (recordset.recordset.length == 0){
            console.log({"Error":"Invalid User"})
            reject({"Error":"Invalid User"})
        }else{
    
                // send records as a response
            console.log(recordset)
            resolve(recordset.recordset[0]);
        }
                
            });
        });
}