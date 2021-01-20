require('dotenv').config();
var exports = module.exports = {};
var sql = require("mssql");
const request = require('request');
var format = require('pg-format');

const authentication = require('../utils/access_token')
const credentials = require('../utils/Credentials')
const resourcesList = require('./GetAllResources')
var jwtDecode = require('jwt-decode');
const { resolve, reject } = require('promise');
exports.getAllResourcesAtLogin = async(req,res)=>{
    try{
        var globalAdmin;
        await credentials.getcredentials(req.header('id')).then(async(cred)=>{//get credentials on basis of A3SId
            globalAdmin = cred.globalAdmin
            await authentication.clientCredAuthenticationForMsManagementApi(cred).then(async(authToken)=>{
                decodedToken = jwtDecode(req.header('Authorization')) //decode the access token to get pid
                console.log("decodedToken-->",decodedToken)
                await resourcesList.subscriptionOrchestration(authToken["access_token"],decodedToken.oid,req.header('Authorization'),decodedToken.name).then((resourcesList)=>{ //list of resources
                   formatResoucesList(resourcesList,decodedToken.unique_name)
                    resourcesList['GlobalAdmin'] = globalAdmin
                    res.send(resourcesList)
                }).catch(err=>{
                    res.status(400).send(err)
                })
            }).catch(err=>{
                console.log(err)
                res.status(400).send(err)
            })
        }).catch(err=>{ // Error in fetching Credentials
            res.status(400).send(err)
        })   
    }catch(err){
        console.log('Please Try Again!',err)
        res.status(404).send(err)
    }
}

async function decodeAuthToken(userAuthToken){
    return new Promise((resolve,reject)=>{
        try{
        var decoded = jwt_decode(userAuthToken)
        resolve(decoded)
        }catch(error){
            reject(error)
        }
    })
}
async function formatResoucesList(resourcesList,userName){
    try{
    formattedResourcesList = []
    if(resourcesList.Subscription_RGList){
        Promise.all(resourcesList.Subscription_RGList.map( eachSubscription => {
            eachSubscription.ResourceGroups.forEach(eachRG =>{
                    element=[]
                element.push(userName)
                element.push(eachSubscription.SubscriptionID)
                element.push(eachSubscription.SubscriptionName)
                element.push(eachRG.Name)
                formattedResourcesList.push(element)
                

                
            })
        return eachSubscription     
        })).then(async(results)=>{
            //console.log(formattedResourcesList)
            console.log("query processing-->")
            await insertIntoDatabase(formattedResourcesList).then(response=>{
                return(response)
            }).catch(err=>{
                console.log(err)
            })
    })
    }else{
        console.log('No resources for this user')
    }
}catch(err){
    console.log(err)
}

}
async function insertIntoDatabase(formattedResourcesList){
    return new Promise((resolve,reject)=>{
        var request = new sql.Request();
        console.log("length",formattedResourcesList.length)
        for(let i=0;i< formattedResourcesList.length;i+=1000){
            query = format('INSERT INTO [PowerBI].[Requestbuffer] (email,subscriptionId,subscriptionName,resourceGroup) VALUES %L' ,formattedResourcesList.slice(i,i+1000));
            console.log(query)
            
            request.query(query, async function (err, recordset){
                if(err){
                    console.log(err)
                    reject(err)
                }else {
                    //alterTableColumnType(process.env.alterFloatForecastSubs).then(response=>{
                        console.log("data inserted---->")
                        resolve({"status":"success"})
                    // }).catch(err=>{
                    //     console.log(err)
                    //     reject(err)
                        
                    // })
                    
                }
            })
        }
    })
}

async function deleteUserDetails(){
    return new Promise((resolve,reject)=>{
        var request = new sql.Request();
        request.query(``,async function (err, recordset){

        })
    })
}
exports.getCredentialsFromDatabase = async(req,res)=>{
    try{
        cred = await credentials.getcredentials(req.header('id')).then(async(cred)=>{
            res.send({"ClientID":cred.clientId,"TenantID":cred.tenantId})
        }).catch(err=>{
            res.status(400).send(err)
        })
    }catch(err){
        res.status(404).send({"Error":"Can't get the credentials. Try Again!!"})
    }
}

