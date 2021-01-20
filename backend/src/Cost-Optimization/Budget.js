require('dotenv').config();
var request = require('request');
var authentication = require('../../utils/access_token')
var credentials = require('../../utils/Credentials')

async function putCommon(url,body,authToken){
    return new Promise((resolve,reject)=>{
        var options = {
            'method': 'PUT',
            'url':`https://management.azure.com/${scope}/providers/Microsoft.Consumption/budgets/${budgetname}?api-version=2019-10-01`,
            'headers': {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)

        };
        request(options, async function(error, response) {
            if (!error && (response.statusCode == 200 || response.statusCode == 201 || response.statusCode == 202)){
                console.log("---------->"+reqData.userId)
                if(response.body == ""){
                resolve({
                    "statusCode" : response.statusCode,
                    "body" : response.body
                })
                }else{
                    resolve({
                        "statusCode" : response.statusCode,
                        "body" : JSON.parse(response.body)
                    })
                }
            }else if(!error && response.statusCode >= 400){
                if(response.statusCode == 429 || response.statusCode == 404) {
                    common(url,body,authToken).then(res=>{
                        resolve(res)
                    }).catch(err=>{
                        reject(err)
                    })
                    
                  }else{
                    console.log("---------->"+reqData.userId)
                    console.log(response.statusCode)
                    console.log(response.body)
                    reject({
                        "statusCode" : response.statusCode,
                        "body" : JSON.parse(response.body)
                    })
                  }
          }else{
              console.log(error)
            reject(error)
          }

    })
})
}

async function getCommon(url,body,authToken){
    return new Promise((resolve,reject)=>{
        var options = {
            'method': 'GET',
            'url':`https://management.azure.com/${scope}/providers/Microsoft.Consumption/budgets/${budgetname}?api-version=2019-10-01`,
            'headers': {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)

        };
        request(options, async function(error, response) {
            if (!error && (response.statusCode == 200 || response.statusCode == 201 || response.statusCode == 202)){
                console.log("---------->"+reqData.userId)
                if(response.body == ""){
                resolve({
                    "statusCode" : response.statusCode,
                    "body" : response.body
                })
                }else{
                    resolve({
                        "statusCode" : response.statusCode,
                        "body" : JSON.parse(response.body)
                    })
                }
            }else if(!error && response.statusCode >= 400){
                if(response.statusCode == 429 || response.statusCode == 404) {
                    common(url,body,authToken).then(res=>{
                        resolve(res)
                    }).catch(err=>{
                        reject(err)
                    })
                    
                  }else{
                    console.log("---------->"+reqData.userId)
                    console.log(response.statusCode)
                    console.log(response.body)
                    reject({
                        "statusCode" : response.statusCode,
                        "body" : JSON.parse(response.body)
                    })
                  }
          }else{
              console.log(error)
            reject(error)
          }

    })
})
}

async function deleteCommon(url,body,authToken){
    return new Promise((resolve,reject)=>{
        var options = {
            'method': 'DELETE',
            'url':`https://management.azure.com/${scope}/providers/Microsoft.Consumption/budgets/${budgetname}?api-version=2019-10-01`,
            'headers': {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)

        };
        request(options, async function(error, response) {
            if (!error && (response.statusCode == 200 || response.statusCode == 201 || response.statusCode == 202)){
                console.log("---------->"+reqData.userId)
                if(response.body == ""){
                resolve({
                    "statusCode" : response.statusCode,
                    "body" : response.body
                })
                }else{
                    resolve({
                        "statusCode" : response.statusCode,
                        "body" : JSON.parse(response.body)
                    })
                }
            }else if(!error && response.statusCode >= 400){
                if(response.statusCode == 429 || response.statusCode == 404) {
                    common(url,body,authToken).then(res=>{
                        resolve(res)
                    }).catch(err=>{
                        reject(err)
                    })
                    
                  }else{
                    console.log("---------->"+reqData.userId)
                    console.log(response.statusCode)
                    console.log(response.body)
                    reject({
                        "statusCode" : response.statusCode,
                        "body" : JSON.parse(response.body)
                    })
                  }
          }else{
              console.log(error)
            reject(error)
          }

    })
})
}

exports.createBudget = async(req,res)=>{
    try{      
        reqData = req.body
        await credentials.getcredentials(req.headers.id).then(async(cred)=>{
            console.log("----------",cred)
            await authentication.clientCredAuthenticationForMsManagementApi(cred).then(async(resToken)=>{
                authManagementResponse = resToken
                authToken = authManagementResponse["access_token"]
                await putCommon(reqData,authToken).then(async(results)=>{
                    console.log("--->",results)
                    res.send(results)
                }).catch(err=>{
                    res.status(400).send(err)
                })
            }).catch((err)=>{
                res.status(400).send(err)
            })
        }).catch(err=>{
            res.status(400).send(err)
    })
    }catch(err){
        console.log(err)
        res.status(400).send(err)
    }
}

exports.getBudget = async(req,res)=>{
    try{      
        reqData = req.body
        await credentials.getcredentials(req.headers.id).then(async(cred)=>{
            console.log("----------",cred)
            await authentication.clientCredAuthenticationForMsManagementApi(cred).then(async(resToken)=>{
                authManagementResponse = resToken
                authToken = authManagementResponse["access_token"]
                await getCommon(reqData,authToken).then(async(results)=>{
                    console.log("--->",results)
                    res.send(results)
                }).catch(err=>{
                    res.status(400).send(err)
                })
            }).catch((err)=>{
                res.status(400).send(err)
            })
        }).catch(err=>{
            res.status(400).send(err)
    })
    }catch(err){
        console.log(err)
        res.status(400).send(err)
    }
}

exports.deleteBudget = async(req,res)=>{
    try{      
        reqData = req.body
        await credentials.getcredentials(req.headers.id).then(async(cred)=>{
            console.log("----------",cred)
            await authentication.clientCredAuthenticationForMsManagementApi(cred).then(async(resToken)=>{
                authManagementResponse = resToken
                authToken = authManagementResponse["access_token"]
                await deleteCommon(reqData,authToken).then(async(results)=>{
                    console.log("--->",results)
                    res.send(results)
                }).catch(err=>{
                    res.status(400).send(err)
                })
            }).catch((err)=>{
                res.status(400).send(err)
            })
        }).catch(err=>{
            res.status(400).send(err)
    })
    }catch(err){
        console.log(err)
        res.status(400).send(err)
    }
}