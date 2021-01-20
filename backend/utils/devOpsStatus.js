require('dotenv').config();
var request = require('request');

function getAvailability(url,authToken){
    return new Promise((resolve,reject)=>{
        var options = {
            'method': 'GET',
            'url':url,
            'headers': {
                'Authorization': authToken,
                'Content-Type': 'application/json'
            }
        };

        request(options, function (error, response) { 
            console.log(response.body)
            if (!error && response.statusCode == 200){
                resolve(JSON.parse(response.body))
            }else if(!error && response.statusCode>=400){
                reject(JSON.parse(response.body))
            }else{
                reject({"Error":"Not Available"})
            }

    })
})
}
//Check AKS Availability
AKSAvailability= async(req,res) => {
    try{
        reqData = req.body
        authToken = req.header('Authorization')
        url = `https://management.azure.com/subscriptions/${reqData.subscriptionId}/resourceGroups/${reqData.resourceGroupName}/providers/Microsoft.ContainerService/managedClusters/${reqData.resourceName}?api-version=2020-03-01`
        await getAvailability(url,authToken).then((results)=>{
            res.send({"Response":results.properties.provisioningState})
        }).catch((err)=>{
            res.status(400).send({"Error":"Not Found"})
    })
    }catch(err){
        console.log(err)
        res.status(404).send({"Error":"Error in fetching status.Try Again!"})
    }
}
//Check Container Registry Availability
containerRegistryAvailability= async(req,res) => {
    reqData = req.body
    try{
        reqData = req.body
        authToken = req.header('Authorization')
        url = `https://management.azure.com/subscriptions/${reqData.subscriptionId}/resourceGroups/${reqData.resourceGroupName}/providers/Microsoft.ContainerRegistry/registries/${reqData.registryName}?api-version=2020-04-01`
        await getAvailability(url,authToken).then((results)=>{
            res.send({"Response":results.properties.provisioningState})
        }).catch((err)=>{
            res.status(400).send(err)
        })
    }catch(err){
        console.log(err)
        res.status(404).send({"Error":"Error in fetching status.Try Again!"})
    }
}
//Check Service Fabric Availabity
serviceFabricAvailability= async(req,res) => {
    try{
        reqData = req.body
        authToken = req.header('Authorization')
        url = `https://management.azure.com/subscriptions/${reqData.subscriptionId}/resourceGroups/${reqData.resourceGroupName}/providers/Microsoft.ServiceFabric/clusters/${reqData.clusterName}?api-version=2018-02-01`
        await getAvailability(url,authToken).then((results)=>{
            res.send({"Response":results.properties.provisioningState})
        }).catch((err)=>{
            res.status(400).send({"Error":err})
        })
    }catch(err){
        console.log(err)
        res.status(404).send({"Error":"Error in fetching status.Try Again!"})
    }
}

module.exports = {AKSAvailability,containerRegistryAvailability,serviceFabricAvailability}

