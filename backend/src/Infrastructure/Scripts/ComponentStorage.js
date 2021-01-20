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
        console.log("-------common ----")
        console.log(options)
        request(options, async function(error, response) {
            console.log(response.body)
            if (!error && (response.statusCode == 200 || response.statusCode == 201 || response.statusCode == 202)){
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

getRequest = async(url,authToken)=>{
    return new Promise((resolve,reject)=>{
        var options = {
            'method': 'GET',
            'url':url,
            'headers': {
                'Authorization': `${authToken}`,
                'Content-Type': 'application/json'
            },
        };
        request(options, function (error, response) {
            if (!error && (response.statusCode == 200 || response.statusCode == 201)){
                resolve({
                    "statusCode" : response.statusCode,
                    "body" : JSON.parse(response.body)
                })
            }else if(!error && response.statusCode >= 400){
                console.log("response",response.body)
                if(response.statusCode == 429) {
                    getRequest(url,authToken).then(res=>{
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
              console.log("cvvd jmmm")
              console.log(error)
              reject({
                "Error" :error
            })
          }

    })

    })
}
//Create ADLSGen1
exports.adlsGen1Orchestration = async(req)=>{
    return new Promise(async(resolve,reject)=>{
        try{        
            reqData = req.body
            authToken = req.header('Authorization')
            adlsgen1URI = `https://management.azure.com/subscriptions/${reqData.subscriptionId}/resourceGroups/${reqData.resource.resourceGroup}/providers/Microsoft.DataLakeStore/accounts/${reqData.DL.adlsName}?api-version=2016-11-01 `
            adlsgen1Body = { 
                location: reqData.DL.location
                } 
            await common(adlsgen1URI,adlsgen1Body,authToken).then((results)=>{
                resolve(results)
            }).catch(err=>{
                console.log("--- in adls1"+err)
                reject(err)
            })
        }catch(err){
            console.log("in try catch")
            reject(err)
            
        }
    })
}
//Create ADLSGen2
exports.adlsGen2Orchestration = async(req)=>{
    return new Promise(async(resolve,reject)=>{
        try{  
            reqData = req.body
            authToken = req.header('Authorization')             
            adlsgen2URI = `https://management.azure.com/subscriptions/${reqData.subscriptionId}/resourceGroups/${reqData.resource.resourceGroup}/providers/Microsoft.Storage/storageAccounts/${reqData.DL.strAccName}?api-version=2019-06-01`
            adlsgen2Body = { 
                "sku": { 
                    "name": reqData.DL.replication 
                }, 
                "kind": "StorageV2", 
                "location": reqData.DL.location, 
                "properties": { 
                    "isHnsEnabled": reqData.DL.isHnsEnabled, 
                    "encryption": { 
                    "services": { 
                        "file": { 
                        "keyType": "Account", 
                        "enabled": true 
                        }, 
                        "blob": { 
                        "keyType": "Account", 
                        "enabled": true 
                        } 
                    }, 
                    "keySource": "Microsoft.Storage" 
                    } 
                }  
            } 
            await common(adlsgen2URI,adlsgen2Body,authToken).then((results)=>{
                resolve(results)
            }).catch(err=>{
                console.log("--- in adlsgen1"+err)
                reject(err)
            })
        }catch(err){
            console.log("in try catch")
            reject(err)
            
        }
    })
}
//Cosmos orchestration
exports.cosmosAccount = async(req)=>{
    return new Promise(async(resolve,reject)=>{
        try{      
            reqData = req.body
            authToken = req.header('Authorization')
            if(reqData.cosmoDB.API === "Core (SQL)"){
                cosmosURI = `https://management.azure.com/subscriptions/${reqData.subscriptionId}/resourceGroups/${reqData.resource.resourceGroup}/providers/Microsoft.DocumentDB/databaseAccounts/${reqData.cosmoDB.name}?api-version=2019-12-12 `
                cosmosBody ={
                    "location": reqData.cosmoDB.location,
                    "properties": {
                    "databaseAccountOfferType": "Standard",
                    "locations": [
                        {
                        "failoverPriority": 0,
                        "locationName": reqData.cosmoDB.geolocation,
                        "isZoneRedundant": false 
                        }
                    ]
                    }
                }
                await common(cosmosURI,cosmosBody,authToken).then((results)=>{
                    resolve(results)
                }).catch(err=>{
                    console.log("--- in cosmos"+err)
                    reject({"Error" : err})
                })
            }else if(reqData.cosmoDB.API === "Azure Table"){
                azureTableURI  = `https://management.azure.com/subscriptions/${reqData.subscriptionId}/resourceGroups/${reqData.resource.resourceGroup}/providers/Microsoft.DocumentDB/databaseAccounts/${reqData.cosmoDB.name}?api-version=2019-12-12`
                azureTableBody = { 
                    "location": reqData.cosmoDB.location,
                    "properties": {
                    "databaseAccountOfferType": "Standard",
                    "locations": [{
                    "failoverPriority": 0,
                    "locationName": reqData.cosmoDB.geolocation,
                    "isZoneRedundant": false
                    }],
                    "capabilities": [{
                    "name": "EnableTable"
                    }]
                    }
                }
                await common(azureTableURI,azureTableBody,authToken).then(async(results)=>{

                    resolve(results)
                }).catch(err=>{
                    reject(err)
                })
            }else if(reqData.cosmoDB.API === "MongoDB API"){
                MongoDBURI  = `https://management.azure.com/subscriptions/${reqData.subscriptionId}/resourceGroups/${reqData.resource.resourceGroup}/providers/Microsoft.DocumentDB/databaseAccounts/${reqData.cosmoDB.name}?api-version=2019-12-12 `
                MongoDBBody = { 
                    "location": reqData.cosmoDB.location,
                    "kind": "MongoDB",
                    "properties": {
                    "databaseAccountOfferType": "Standard",
                    "locations": [{
                    "failoverPriority": 0,
                    "locationName": reqData.cosmoDB.geolocation,
                    "isZoneRedundant": false
                    }]
                    }
                }
                await common(MongoDBURI,MongoDBBody,authToken).then(async(results)=>{
                    resolve(results)
                }).catch(err=>{
                    reject(err)
                })

            }
                    
        }catch(err){
            console.log("in try catch")
            reject(err)
            
        }
    })

}
//check wether cosmos Account has successfully created or not
//if yes the create the cosmos sql database
exports.checkCosmosAvailabaility = async(req,res)=>{
    try{      
        reqData = req.body
        authToken = req.header('Authorization')
        getCosmosURI = `https://management.azure.com/subscriptions/${reqData.subscriptionId}/resourceGroups/${reqData.resource.resourceGroup}/providers/Microsoft.DocumentDB/databaseAccounts/${reqData.cosmoDB.name}?api-version=2020-04-01`
        await getRequest(getCosmosURI,authToken).then(async(results)=>{
            console.log("--->",results)
            if(results.body.properties.provisioningState === "Succeeded"){
                await cosmosOrchestration(reqData,authToken).then((results)=>{
                    res.send(results)
                }).catch(err=>{
                    res.status(400).send(err)
                })

            }else{
                res.send({"status":results.body.properties.provisioningState})
            }
        }).catch(err=>{
            res.status(400).send(err)

    })
    }catch(err){
        console.log(err)
        res.status(400).send(err)
    }
}
// create the cosmos sql database
async function cosmosOrchestration(reqData,authToken){
    return new Promise(async(resolve,reject)=>{
        try{      
            if(reqData.cosmoDB.API === "Core (SQL)"){
                cosmosSQLURI = `https://management.azure.com/subscriptions/${reqData.subscriptionId}/resourceGroups/${reqData.resource.resourceGroup}/providers/Microsoft.DocumentDB/databaseAccounts/${reqData.cosmoDB.name}/sqlDatabases/${reqData.cosmoDB.name}-sql?api-version=2019-12-12 `
                cosmosSQLBody ={
                    "location": reqData.cosmoDB.location,
                    "tags": {},
                    "properties": {
                        "resource": {
                        "id": reqData.cosmoDB.name+"-sql"
                        },
                        "options": {}
                    }
                    } 
                await common(cosmosSQLURI,cosmosSQLBody,authToken).then(async(results)=>{
                    console.log(results)
                    cosmosSQLContainerURI = `https://management.azure.com/subscriptions/${reqData.subscriptionId}/resourceGroups/${reqData.resource.resourceGroup}/providers/Microsoft.DocumentDB/databaseAccounts/${reqData.cosmoDB.name}/sqlDatabases/${reqData.cosmoDB.name}-sql/containers/${reqData.cosmoDB.name}-container?api-version=2019-12-12  `
                    cosmosSQLConatinerBody ={
                        "location": reqData.cosmoDB.location,
                        "tags": {},
                        "properties": {
                        "resource": {
                        "id": reqData.cosmoDB.name+"-container",
                        "excludedPaths": []
                        },
                        "partitionKey": {
                        "paths": [
                        "/AccountNumber"
                        ],
                        "kind": "Hash"
                        },
                        "defaultTtl": 100,
                        "uniqueKeyPolicy": {
                        "uniqueKeys": [{
                        "paths": [
                        "/testPath"
                        ]
                        }]
                        },
                        "options": {}
                        }
                        }
                    await common(cosmosSQLContainerURI,cosmosSQLConatinerBody,authToken).then((results)=>{
                        resolve(results)
                    }).catch(err=>{
                        reject(err)
                    })

                }).catch(err=>{
                    console.log("--- in cosmosSQL"+err)
                    console.log(err)
                    reject(err)
                })
            }else if(reqData.cosmoDB.API === "Azure Table"){
                    tableURI = `https://management.azure.com/subscriptions/${reqData.subscriptionId}/resourceGroups/${reqData.resource.resourceGroup}/providers/Microsoft.DocumentDB/databaseAccounts/${reqData.cosmoDB.name}/tables/${reqData.cosmoDB.name}-table?api-version=2019-12-12 `
                    tableBody = { 
                        "location": reqData.cosmoDB.location,
                        "tags": {},
                        "properties": {
                            "resource": {
                            "id": reqData.cosmoDB.name+"-table"
                            },
                            "options": {}
                        }
                        } 
                    await common(tableURI,tableBody,authToken).then(async(results)=>{
                        resolve(results)
                    }).catch((err)=>{
                        reject(err)
                    })
            }else if(reqData.cosmoDB.API === "MongoDB API"){
                    MongoURI = `https://management.azure.com/subscriptions/${reqData.subscriptionId}/resourceGroups/${reqData.resource.resourceGroup}/providers/Microsoft.DocumentDB/databaseAccounts/${reqData.cosmoDB.name}/mongodbDatabases/${reqData.cosmoDB.name}-mongodb?api-version=2019-12-12 `
                    MongoBody = { 
                        "location": reqData.cosmoDB.location,
                        "tags": {},
                        "properties": {
                            "resource": {
                            "id": reqData.cosmoDB.name+"-mongodb"
                            },
                            "options": {}
                        }
                        } 
                    await common(MongoURI,MongoBody,authToken).then(async(results)=>{
                        console.log("here------>",results)
                        cosmosMongoDBContainerURI = `https://management.azure.com/subscriptions/${reqData.subscriptionId}/resourceGroups/${reqData.resource.resourceGroup}/providers/Microsoft.DocumentDB/databaseAccounts/${reqData.cosmoDB.name}/mongodbDatabases/${reqData.cosmoDB.name}-mongodb/collections/${reqData.cosmoDB.name}-collection?api-version=2019-12-12 `
                        cosmosMongoDBContainerBody = {
                            "location": reqData.cosmoDB.location,
                            "tags": {},
                            "properties": {
                            "resource": {
                            "id": reqData.cosmoDB.name +"-collection",
                            "options": {
                            }
                            },
                            "shardKey": {
                            "testKey": "Hash"
                            },
                            "options": {}
                            }
                            }
                    await common(cosmosMongoDBContainerURI,cosmosMongoDBContainerBody,authToken).then((results)=>{
                        resolve(results)
                    }).catch(err=>{
                        reject(err)
                    })
                }).catch((err)=>{
                    console.log("sdvdfg",err)
                    reject(err)
                })
            }
        }catch(err){
            console.log("in try catch")
            console.log(err)
            reject(err)
            
        }
    })

}
//Create Server
exports.createServer = async(req)=>{
    return new Promise(async(resolve,reject)=>{
        try{  
            reqData = req.body
            authToken = req.header('Authorization')    
            serverURI =`https://management.azure.com/subscriptions/${reqData.subscriptionId}/resourceGroups/${reqData.resource.resourceGroup}/providers/Microsoft.Sql/servers/${reqData.server.serverName}?api-version=2019-06-01-preview` 
            serverBody = { 
                "properties": { 
                    "administratorLogin": reqData.server.userName, 
                    "administratorLoginPassword": reqData.server.conPassword
                }, 
                "location": reqData.server.location 
            }
            await common(serverURI,serverBody,authToken).then(async(results)=>{
                resolve(results)
            }).catch(err=>{
                console.log("--- in server"+err)
                reject(err)

            })
        }catch(err){
            console.log("in try catch")
            reject(err)
            
        }


    })
}
//If Server is succesfi=ully created then
//deploy sql db,synapse databse and elastic pool
exports.databaseOrchestration = async(req)=>{
    return new Promise(async(resolve,reject)=>{
        try{ 
            reqData = req.body
            authToken = req.header('Authorization')     
            checkserverURI  = `https://management.azure.com/subscriptions/${reqData.subscriptionId}/resourceGroups/${reqData.resource.resourceGroup}/providers/Microsoft.Sql/servers/${reqData.server.serverName}?api-version=2019-06-01-preview`
            console.log(authToken)
            await getRequest(checkserverURI,authToken).then(async(results)=>{
                console.log("--->",results)
                if(results.body.properties.state === "Ready"){
                    if(reqData.type === "SQL Database"){
                        singleInstanceURI = `https://management.azure.com/subscriptions/${reqData.subscriptionId}/resourceGroups/${reqData.resource.resourceGroup}/providers/Microsoft.Sql/servers/${reqData.server.serverName}/databases/${reqData.DB.dbName}?api-version=2019-06-01-preview`
                        singleInstanceBody = { 
                            "location": reqData.server.location
                        }
                        await common(singleInstanceURI,singleInstanceBody,authToken).then((results)=>{
                            resolve(results)
                        }).catch(err=>{
                            reject(err)
                        })
                    }else if(reqData.type === "Azure Synapse Analytics"){
                        datawarehouseURI = `https://management.azure.com/subscriptions/${reqData.subscriptionId}/resourceGroups/${reqData.resource.resourceGroup}/providers/Microsoft.Sql/servers/${reqData.server.serverName}/databases/${reqData.DW.dbName}?api-version=2017-10-01-preview`
                        datawarehouseBody ={
                            "location": reqData.server.location,
                            "sku": {
                                "name": "DW1000c"
                            }
                            }
                        await common(datawarehouseURI,datawarehouseBody,authToken).then((results)=>{
                            resolve(results)
                        }).catch(err=>{
                            reject(err)
                        })
                    }else if(reqData.type === "SQL Database Elastic Pool"){
                        elasticpoolURI = `https://management.azure.com/subscriptions/${reqData.subscriptionId}/resourceGroups/${reqData.resource.resourceGroup}/providers/Microsoft.Sql/servers/${reqData.server.serverName}/elasticPools/${reqData.EP.ElasticPool}?api-version=2017-10-01-preview`
                        elasticpoolBody = {
                            "location": reqData.server.location ,
                            "sku": {
                                "name": "GP_Gen5_2",
                                "tier": "GeneralPurpose",
                                "capacity": 2
                            },
                            "properties": {
                                "perDatabaseSettings": {
                                "minCapacity": 0.25,
                                "maxCapacity": 2
                                }
                            }
                            }
                        await common(elasticpoolURI,elasticpoolBody,authToken).then((results)=>{
                            console.log("----->",results)
                            resolve(results)
                        }).catch(err=>{
                            reject(err)
                        })
                    }

                }else{
                    resolve({"status":results.body.properties.state})
                }  
            }).catch(err=>{
                console.log("get COmmon error")
                reject(err)
            })
        }catch(err){
            console.log(err)
            reject(err)
        }

    })
    

}
//check wether elasticpool created or not
//if yes then create the elsticPool database
exports.checkElasticPoolAvailabaility = async(req,res)=>{
    try{      
        reqData = req.body
        authToken = req.header('Authorization')
        elasticPoolURI = `https://management.azure.com/subscriptions/${reqData.subscriptionId}/resourceGroups/${reqData.resource.resourceGroup}/providers/Microsoft.Sql/servers/${reqData.server.serverName}/elasticPools/${reqData.EP.ElasticPool}?api-version=2017-10-01-preview `
        await getRequest(elasticPoolURI,authToken).then(async(results)=>{
            console.log("--->",results)
            if(results.body.properties.state === "Ready"){
                elasticPoolID = results.body.id
                await elasticPoolDatabaseDeployment(elasticPoolID,reqData,authToken).then((results)=>{
                    res.send(results)
                }).catch(err=>{
                    res.status(400).send(err)
                })

            }else{
                res.send({"status":results.body.properties.state})
            }  
        }).catch(err=>{
            console.log("get Common error")
            res.status(400).send(err)
        })
    }catch(err){
        console.log(err)
        res.status(400).send(err)
    }
}
//create the elsticPool database
elasticPoolDatabaseDeployment = async(elasticPoolID,reqData,authToken)=>{
    return new Promise(async(resolve,reject)=>{
        EPDeployURI = `https://management.azure.com/subscriptions/${reqData.subscriptionId}/resourceGroups/${reqData.resource.resourceGroup}/providers/Microsoft.Sql/servers/${reqData.server.serverName}/databases/${reqData.EP.dbName}?api-version=2017-10-01-preview `
        EPDeployBody = { 
            "location": reqData.server.location,
            "properties": {
              "elasticPoolId":elasticPoolID
            }
          }
          await common(EPDeployURI,EPDeployBody,authToken).then((results)=>{
            resolve(results)
          }).catch(err=>{
              reject(err)
          })
    })

}