require('dotenv').config();
var exports = module.exports = {};
var sql = require("mssql");
const request = require('request');
const authentication = require('../utils/access_token');
const { reject } = require('promise');

//Orchestration to add credentials into database -get resgistered
exports.updateCredentials = async(req,res)=>{
    data = req.body
    await insertCredentialsIntoDatabase(data).then((response)=>{
        res.send(response)
    }).catch((err)=>{
        res.status(400).send(err)
    })
}
//Insert records in database
async function insertCredentialsIntoDatabase(data){
    try{
        return new Promise(async(resolve,reject)=>{
            var request = new sql.Request();
            await generateID(data.globalAdmin).then((results)=>{
                console.log(`insert into admin_auth.loginauth (userId,clientId,clientSecret,tenantId,globalAdmin,ou,a3sId) values ('${data.userId}','${data.clientId}','${data.clientSecret}','${data.tenantId}','${data.globalAdmin}','${results.ou}','${results.id}')`)
                request.query(`insert into admin_auth.loginauth (userId,clientId,clientSecret,tenantId,globalAdmin,ou,a3sId) values ('${data.userId}','${data.clientId}','${data.clientSecret}','${data.tenantId}','${data.globalAdmin}','${results.ou}','${results.id}')`, function (err, recordset) {
                    if(err){
                        console.log(err)
                        reject({"Error":"Error in getting data in"})
                    }else{
                        resolve({"Status":"Success","A3SID":results.id})
                    }
                })

            }).catch((err)=>{
                console.log(err)
                reject({"Error":"Error in getting A3SId.Please Try Again"})
            })
            
            })
    }catch(err){
        console.log(err)
        reject({"Error":"Something went Wrong. Please try Again"+err})
    }    
}

//Generate A3S ID
async function generateID(globalAdmin){
    return new Promise((resolve,reject)=>{
        try{
            ouId = globalAdmin.split('@').pop()
            id = "a3s@"+ouId
            resolve({"id":id,"ou":ouId}) // return ou and a3sID
        }catch(err){
           reject(err)
        }
    })
}

//Orchestration to Test Credentials entered by user
exports.testCredentials = async(req,res)=>{
    data = req.body
    await testRecord(data).then((response)=>{
        res.send(response)
    }).catch((err)=>{
        res.status(400).send(err)
    })
}
//Test all the enteries
async function testRecord(data){
    return new Promise((resolve,reject)=>{
        var request = new sql.Request();
        ouId = data.globalAdmin.split('@').pop()
        //check wether the organization(ou) is already registered or not
        request.query(`select * from admin_auth.loginauth where ou = '${ouId}'`, async function (err, recordset) {
            if(err){
                reject({"Error":"Error in fetching details from DB Try Again!"})
            }else if(recordset.recordset.length === 0){ //ou is not registered
                await authentication.clientCredAuthenticationForMsGraphApi(data).then(async(response)=>{ //generate token- validate clientid,secret,tenantid
                    tokendetails = response
                await globalAdminCheck(data,tokendetails["access_token"]).then((response)=>{//check global admin mail
                        resolve(response)
                    }).catch((err)=>{
                        reject(err)
                    })
    
                }).catch((err)=>{
                    reject({"Error":"Invalid Credentials"}) // if token is not generated
                })
            }else{
                reject({"Error":"Organization is already registered!"})// if recordset length is not 0
            }
        })
    })
}
//validate global admin mailid
async function globalAdminCheck(info,authToken){
    return new Promise((resolve,reject)=>{
        ouID = info.globalAdmin.split("@").pop()
        console.log("--->",ouID)
        var options = {
            'method': 'GET',
            'url': `https://graph.microsoft.com/v1.0/domains/${ouID}`,
            'headers': {
              'Authorization': `Bearer ${authToken}`
            }
          };
        request(options, function (error, response) { 
            console.log(response.body)
            if (!error && response.statusCode == 200) {
                getUserslist(authToken,info.globalAdmin).then((response)=>{
                    resolve({"Response":"Valid Global Admin"});
                }).catch(err=>{
                    reject({"Error":"Invalid Global Admin"});
                })
                
            } else {
                reject({"Error":"Invalid Global Admin"});
            }
          });

    })
}
//details of global Admin-to check wether the global abmin is correct or not
function getUserslist(authToken,globalAdmin){
    return new Promise((resolve,reject)=>{
        var options = {
            'method': 'GET',
            'url': `https://graph.microsoft.com/v1.0/users/${globalAdmin}`,
            'headers': {
                'Authorization': `Bearer ${authToken}`
            },
        formData: {
            'resource': 'https://graph.microsoft.com'
        }
    };
        request(options, function (error, response) {
            
            if (!error && response.statusCode == 200) {
                resolve(response.body);
            } else {
                console.log("error")
                reject(error);
            }
    });

    })
    

}