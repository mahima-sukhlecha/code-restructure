require('dotenv').config();
const request = require('request');
var sql = require("mssql");
var fs = require("fs");
var jwtDecode = require('jwt-decode');
agentList = {
    "value":[
        {
            "Name":"Ayush Badhera",
            "Email":"ayush.badhera@celebaltech.com"
        },
        {
            "Name":"Harshil Assudani",
            "Email":"harshil.assudani@celebaltech.com"
        },
        {
            "Name":"Nilay Maheshwari",
            "Email":"nilay.maheshwari@celebaltech.com"
        },
        {
            "Name":"Muskan Khatnani",
            "Email":"muskan.khatnani@celebaltech.com"
        },{
            "Name":"Mahima Sukhlecha",
            "Email":"mahima.sukhlecha@celebaltech.com"
        }
    ]
}

verifyAuthToken = (token)=>{
    return new Promise((resolve,reject)=>{
        try{
        tenantId = (jwtDecode(token)).tid //decode the access token to get tenant id
        var request = new sql.Request();
        request.query(`SELECT * FROM [admin_auth].[loginauth] WHERE tenantId = '${tenantId}'`,async function(err,recordset){
            if(err){
                reject({"statusCode":400,"message":{"Error":err}})
            }
            else if(recordset.recordset.length === 0){
                reject({"statusCode":401,
                "message":{"Error":"Unauthorized"}})
            }else{
                resolve(true)
            }
        })
    }catch(err){
        reject({"statusCode":400,"message":{"Error":err}})
    }
        })
}

exports.getAgentList = async(req,res)=>{
    try{
        //var agentList = fs.readFileSync("./listOfAgents")
        res.send(agentList)
    }catch(err){
        res.status(404).send(err)
    }
}
//https://a3s-backend-node.azurewebsites.net/api/agents-List