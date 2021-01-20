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

        request(options, function (error, response) {
            if (!error && (response.statusCode == 200 || response.statusCode == 201)){
                resolve({
                    "statusCode" : response.statusCode,
                    "body" : JSON.parse(response.body)
                })
            }else if(!error && response.statusCode >= 400){
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

exports.containerInstanceOrchestration = async(req)=>{
    return new Promise(async(resolve,reject)=>{
        try{      
            reqData = req.body
            authToken = req.header('Authorization')
            instanceURI = `https://management.azure.com/subscriptions/${reqData.data.subscriptionId}/resourceGroups/${reqData.data.ContainerInstanceResourceGroupInfo.ACIresourceGroupName}/providers/Microsoft.ContainerInstance/containerGroups/${reqData.data.ContainerInstanceInfo.ContainerInstanceName}?api-version=2018-10-01`
            instanceBody = {
                "location": reqData.data.ContainerInstanceInfo.ContainerInstanceLocation,	
                "properties": {
                "containers": [{
                "name": reqData.data.ContainerInstanceInfo.ControlInstanceContainerName,
                "properties": {
                "command": [],
                "environmentVariables": [],
                "image": reqData.data.ContainerInstanceInfo.ControlInstanceContainerImage,
                "ports": [{
                "port": reqData.data.ContainerInstanceInfo.ControlInstancePortNumber
                }],
                "resources": {
                "requests": {
                "cpu": reqData.data.ContainerInstanceInfo.ControlInstanceCPUCore,
                "memoryInGB": reqData.data.ContainerInstanceInfo.ControlInstanceMemory
                }
                }
                }
                }],
                "imageRegistryCredentials": [],
                "ipAddress": {
                "ports": [{
                "protocol": reqData.data.ContainerInstanceInfo.ContainerInstanceProtocol,
                "port": reqData.data.ContainerInstanceInfo.ControlInstancePortNumber
                }],
                "type": "Public",
                "dnsNameLabel": reqData.data.ContainerInstanceInfo.ContainerInstanceDNSName
                },
                "osType": reqData.data.ContainerInstanceInfo.ControlInstanceOS
                }
                }
                
            await common(instanceURI,instanceBody,authToken).then((results)=>{
                resolve(results)
            }).catch(err=>{
                console.log("--- in regisry"+err)
                reject({"Error" : err})
            })
        
        }catch(err){
            console.log("in try catch")
            reject(err)
            
        }
    })
}

exports.containerRegistryOrchestration = async(req)=>{
    return new Promise(async(resolve,reject)=>{
        try{      
            reqData = req.body
            authToken = req.header('Authorization')
            registryURI = `https://management.azure.com/subscriptions/${reqData.data.subscriptionId}/resourceGroups/${reqData.data.RegistryConfg.resourceGroupName}/providers/Microsoft.ContainerRegistry/registries/${reqData.data.RegistryConfg.containerregistryName}?api-version=2019-05-01`
            registryBody = { 
                "location": reqData.data.RegistryConfg.contaainerRegistryLocation,  
                "sku": { 
                    "name": reqData.data.RegistryConfg.containerregistrySKU 
                },
                "properties": { 
                    "adminUserEnabled": reqData.data.RegistryConfg.adminEnable 
                } 
            }
            await common(registryURI,registryBody,authToken).then((results)=>{
                resolve(results)
            }).catch(err=>{
                console.log("--- in regisry"+err)
                reject({"Error" : err})
            })
        }catch(err){
            console.log("in try catch")
            reject(err)
            
        }
    })
}
