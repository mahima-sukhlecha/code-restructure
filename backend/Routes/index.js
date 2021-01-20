// var express = require('express');
// var router = express.Router();
var sql = require('mssql');
// var dbConfig = require('../config/db');
// var sequelizeDBConfig = require('../config/db_sequlize');
var async = require('async');
const https = require('https');
const http = require('http');
var jwtDecode = require('jwt-decode');
//var formidable = require('formidable');
//const sgMail = require('@sendgrid/mail');
//const querystring = require('querystring');
var fs = require('fs');
// var bodyParser = require('body-parser')
// var xl = require('excel4node');
// const excel = require('exceljs');
// const cron = require('node-cron');
var request = require("request");
var auth = require('./authentication');
var config = require('./config.json');
var utils = require('./utils1.js');
async function getReport (reportIdVal) {
    console.log("------------>",reportIdVal)
    // validate configuration info
    res = utils.validateConfig();
    if(res){
       console.log("error: "  + res);
       return;
    }

    // get aad token to use for sending api requests
    tokenResponse = await auth.getAuthenticationToken();
    if(('' + tokenResponse).indexOf('Error') > -1){
        console.log('' + tokenResponse);
        return;
    }
    
    var token = tokenResponse.accessToken;
    console.log("Returned accessToken: " + token);
//token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6Imh1Tjk1SXZQZmVocTM0R3pCRFoxR1hHaXJuTSIsImtpZCI6Imh1Tjk1SXZQZmVocTM0R3pCRFoxR1hHaXJuTSJ9.eyJhdWQiOiJodHRwczovL21hbmFnZW1lbnQuYXp1cmUuY29tIiwiaXNzIjoiaHR0cHM6Ly9zdHMud2luZG93cy5uZXQvZTRlMzQwMzgtZWExZi00ODgyLWI2ZTgtY2NkNzc2NDU5Y2EwLyIsImlhdCI6MTU5NzIyNTAzNCwibmJmIjoxNTk3MjI1MDM0LCJleHAiOjE1OTcyMjg5MzQsImFpbyI6IkUyQmdZRGpWYy9BTXY4amEzeW9NN2J4Wng5ZTlBUUE9IiwiYXBwaWQiOiJlMTQ1NmQ5Zi04ZjVkLTRiNTYtOGQzYS03ZDM2YzljN2QyOGEiLCJhcHBpZGFjciI6IjEiLCJncm91cHMiOlsiYzU2NGJiY2EtYjcyOC00ZDZhLTg4NDktYmM2OTQ1ZmI4ZmVkIiwiMDg0Y2UwNDItMGQ4NC00YmI4LWJlZTctMjEzYjBkNDI5MTIxIiwiMmExNjQ5NDMtZWYwMC00NjM1LTg1MzEtODRhZTkzNTZiMDNjIl0sImlkcCI6Imh0dHBzOi8vc3RzLndpbmRvd3MubmV0L2U0ZTM0MDM4LWVhMWYtNDg4Mi1iNmU4LWNjZDc3NjQ1OWNhMC8iLCJvaWQiOiI2YmI4ODU0Ni00NGQ2LTQ0ZDktYjY1Yy0wNDk4Y2QxMDBhMWQiLCJzdWIiOiI2YmI4ODU0Ni00NGQ2LTQ0ZDktYjY1Yy0wNDk4Y2QxMDBhMWQiLCJ0aWQiOiJlNGUzNDAzOC1lYTFmLTQ4ODItYjZlOC1jY2Q3NzY0NTljYTAiLCJ1dGkiOiJJVmJVZFNadjBFT1ZuckE0ZnB1LUFRIiwidmVyIjoiMS4wIiwieG1zX3RjZHQiOjE0ODMxNzg4NjB9.L6RvcqKK1krtG75puTrK1G-3G_ApZUNIWjVUouxCPJ17_oZ7afcm4LsbzkThZC2GqyNHNG4Gj4ERTQhpIuLVAm1x44TWteOpoptfaLuhKlOKbziWIEF3FwbaWNbXKJt3Xtz2mjcgkjLi_xcjg-Xg8RVZkDfRM8DyKqQInOz5E22-xI3a8zyA-oa9Db-Wcr1fZ8Mc1ZVvPM9-B_VlztIHq4ISkdLOdxv7ywcg8zpN21ExmcWHZgR1B7CHBSdb8ZBVCETTvnRaJZK1UxrfyZT4Yq0sIglvzWF940KOaG9DX8KqpWPJqMVHcM_PAHLkelNDUkbDoC9DfmbVhoIKa5HDiw"
    // create reqest for GetReport api call
    var requestParams = utils.createGetReportRequestParams(token)


    // get the requested report from the requested api workspace.
    // if report not specified - returns the first report in the workspace.
    // the request's results will be printed to console.
    return await utils.sendGetReportRequestAsync(requestParams.url, requestParams.options,reportIdVal);
}

async function generateEmbedToken(reportIdVal,username,datasetId){
    // validate configuration info
    res = utils.validateConfig();
    if(res){
       console.log("error: "  + res);
       return;
    }
    console.log('calll function');
    // get aad token to use for sending api requests
    tokenResponse = await auth.getAuthenticationToken();
    if(('' + tokenResponse).indexOf('Error') > -1){
        console.log('' + tokenResponse);
        return;
    }
    
    var token = tokenResponse.accessToken;
    var authHeader = utils.getAuthHeader(token);

    // get report id to use in GenerateEmbedToken requestd
    var reportId;
    if(!config.reportId){
        console.log("Getting default report from workspace for generating embed token...")

        var reportParams = utils.createGetReportRequestParams(token)
        reportResp = await utils.sendGetReportRequestAsync(reportParams.url, reportParams.options);
        if(!reportResp) {
            return;
        }
        reportId = reportResp.id
    } else{
        reportId = reportIdVal;
    } 

    var headers = {
        'Authorization': authHeader,
        'Content-Type': 'application/json'      
    };

   /* 
   for adding security in the power bi embedded and roles
    "identities": [
        {
        "username": config.appId,
        "roles": [
        "Test Role"
        ],
        "datasets": [
        "9ead60f6-e044-4e53-88ae-fb15d41f3037"
        ],
        }
        ]*/

    var options = {
            headers: headers,
            method: 'POST',
            body:JSON.stringify({
            "accessLevel": "View",
            "identities": [{
                "username":username,
                "roles": ["New role"],
                "datasets": datasetId
            }]
        })
    };
    var options1 = {
        headers: headers,
        method: 'POST',
        body: JSON.stringify({"accessLevel": "View",
        "identities": [{
            "username":username,
            "roles": ["Role_1"],
            "datasets": datasetId //e63f6ab2-c5f5-40c1-abef-36964bc2d6e1-- Application Health Monitoring
        }]})
    };
    var options2 = {
        headers: headers,
        method: 'POST',
        body:JSON.stringify({
        "accessLevel": "View",
        "identities": [{
            "username":username,
            "roles": ["Access_Role","Global_admin"], //[Access_Role,Global_admin] //Report ID : e6728bf5-6222-42de-809b-3d36b6695ea5 //
            "datasets": datasetId
        }]
    })

    }

    var url = config.apiUrl + 'v1.0/myorg/groups/' + config.workspaceId + '/reports/' + reportId + '/GenerateToken';

    // generate powerbi embed token to use for embed report.
    // the returned token will be printed to console.
    console.log(datasetId)
    if(datasetId[0] === "ba3d483d-cd58-46ab-8f6a-8d1dc4e45f4a"){ // Cost-Optimization
        console.log("here--->")
        return await utils.sendGenerateEmbedTokenRequestAsync(url, options,reportIdVal);
    }else if(datasetId[0] === "4e828801-0ce7-4c1e-826f-fff588cf6eb4"){ // Activity logs
        return await utils.sendGenerateEmbedTokenRequestAsync(url, options2,reportIdVal);
    }else{
        console.log("here------->")
        return await utils.sendGenerateEmbedTokenRequestAsync(url, options1,reportIdVal);
    }
    
}
exports.getTokenForPowerBI = async(req,res)=> {
    console.log(req.body)
    var reportIdVal = req.body.reportId;

    // var loadPort = req.body.loadPort;
    getReport(reportIdVal).then(function(res1){
        console.log("res1-->",res1)
        if(req.body.unique_name){
            username = req.body.unique_name
            console.log("username--->", username)
        }else if(req.header('Authorization')){
            authToken = (req.header('Authorization')).split(" ")[1]
            decodedToken = jwtDecode(authToken) //decode the access token to get username
            username = decodedToken.unique_name
            console.log("username--->", username)
        }
        generateEmbedToken(reportIdVal,username,req.body.datasetId).then(function(res2){
            res.status(200).json({ accessToken: res2 });
        })
    })
}
