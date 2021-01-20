require('dotenv').config();
var request = require('request');

async function common(url,body,authToken){
    return new Promise((resolve,reject)=>{
        var options = {
            'method': 'PUT',
            'url':url,
            'headers': {
                'Authorization': `${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)

        };
        request(options, function (error, response) {
            if (!error && (response.statusCode == 201 || response.statusCode == 200 )){
                resolve({
                    "statusCode" : response.statusCode,
                    "body" : JSON.parse(response.body)
                })
            }else if(!error && response.statusCode >= 400){
              console.log(response.statusCode)
              console.log(response.body)
              reject({
                "statusCode" : response.statusCode,
                "body" : JSON.parse(response.body)
            })
          }else{
            reject(error)
          }

    })
})
}

exports.apimOrchestration = async(req)=>{
    return new Promise(async(resolve,reject)=>{
        try{
            reqData = req.body
            authToken = req.header('Authorization') 
            apimURI = `https://management.azure.com/subscriptions/${reqData.subscriptionId}/resourceGroups/${reqData.resource.resourceGroup}/providers/Microsoft.ApiManagement/service/${reqData.APIM.name}?api-version=2019-12-01 `
            apimBody = { 
                "properties": {
                    "publisherEmail": reqData.APIM.email,
                    "publisherName": reqData.APIM.orgName
                },
                "sku": {
                    "name": reqData.APIM.price,
                    "capacity": 1
                },
                "location": reqData.APIM.location
                }
            await common(apimURI,apimBody,authToken).then((results)=>{
                resolve(results)
            }).catch(err=>{
                console.log("--- in apim"+err)
                reject(err)
            })
        }catch(err){
            console.log("in try catch")
            reject(err)
            
        }
    })
}

exports.logicAppOrchestration = async(req)=>{
    return new Promise(async(resolve,reject)=>{
        try{      
            reqData = req.body
            authToken = req.header('Authorization') 
            logicappURI = `https://management.azure.com/subscriptions/${reqData.subscriptionId}/resourceGroups/${reqData.resource.resourceGroup}/providers/Microsoft.Logic/workflows/${reqData.APP.name}?api-version=2016-06-01`
            logicappBody = { 
                "properties": { 
                    "definition": { 
                    "$schema": "https://schema.management.azure.com/providers/Microsoft.Logic/schemas/2016-06-01/workflowdefinition.json#",
                    "contentVersion": "1.0.0.0",
                    "parameters": {},
                    "triggers": {},
                    "actions": {}, 
                    "outputs": {} 
                    }
                },
                "location": reqData.APP.location
                } 
            await common(logicappURI,logicappBody,authToken).then((results)=>{
                resolve(results)
            }).catch(err=>{
                console.log("--- in logicapp"+err)
                reject( err)
            })
        }catch(err){
            console.log("in try catch")
            console.log(err)
            reject(err)
            
        }
    })
}

