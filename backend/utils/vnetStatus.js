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
        try{
            request(options, function (error, response) { 
                if (!error && response.statusCode ==200){
                    resolve(JSON.parse(response.body))
                }else if(!error && response.statusCode>=400){
                    reject(JSON.parse(response.body))
                }else{
                    reject({"Error":"Not Available"})
                }
            })
        }catch(err){
            console.log(err)
            reject(err)
        }
    })
}
//To check whether the Vnet is available in particular RG or not
vnetAvailability= async(req,res) => {
    try{
        reqData = req.body
        authToken = req.header('Authorization')
        url = `https://management.azure.com/subscriptions/${reqData.subscriptionId}/resourceGroups/${reqData.resourceGroupName}/providers/Microsoft.Network/virtualNetworks/${reqData.virtualNetworkName}?api-version=2020-04-01`
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
// To check whether the Vnet is available in particular RG or not
firewallAvailability= async(req,res) => {
    try{
        reqData = req.body
        authToken = req.header('Authorization')
        url = `https://management.azure.com/subscriptions/${reqData.subscriptionId}/resourceGroups/${reqData.resourceGroupName}/providers/Microsoft.Network/azureFirewalls/${reqData.azureFirewallName}?api-version=2020-04-01`
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
// To check whether VnetPeering name is available or not
vnetPeeringAvailability= async(req,res) =>{
    try{
        reqData = req.body
        authToken = req.header('Authorization')
        url = `https://management.azure.com/subscriptions/${reqData.subscriptionId}/resourceGroups/${reqData.resourceGroupName}/providers/Microsoft.Network/virtualNetworks/${reqData.virtualNetworkName}/virtualNetworkPeerings/${reqData.virtualNetworkPeeringName}?api-version=2020-04-01`
        await getAvailability(url,authToken).then((results)=>{
            res.send({"Response":results.properties.provisioningState})
        }).catch((err)=>{
            res.status(404).send(err)
        })
    }catch(err){
        console.log(err)
        res.status(400).send({"Error":"Error in fetching status.Try Again!"})
    }
}
//To check whether the PublicIP Name is available or not
publicIPAvailability= async(req,res) => {
    try{
        reqData = req.body
        authToken = req.header('Authorization')
        url = `https://management.azure.com/subscriptions/${reqData.subscriptionId}/resourceGroups/${reqData.resourceGroupName}/providers/Microsoft.Network/publicIPAddresses/${reqData.publicIpAddressName}?api-version=2020-04-01`
        await getAvailability(url,authToken).then((results)=>{
            res.send(results)
        }).catch((err)=>{
            res.status(400).send(err)
        })
    }catch(err){
        console.log(err)
        res.status(404).send({"Error":"Error in fetching status.Try Again!"})
    }
}
//To check whether the Virtual network gateway name is available or not
gatewayAvailability= async(req,res) => {
    try{
        reqData = req.body
        authToken = req.header('Authorization')
        url = `https://management.azure.com/subscriptions/${reqData.subscriptionId}/resourceGroups/${reqData.resourceGroupName}/providers/Microsoft.Network/virtualNetworkGateways/${reqData.virtualNetworkGatewayName}?api-version=2020-04-01`
        await getAvailability(url,authToken).then((results)=>{
            res.send(results)
        }).catch((err)=>{
            res.status(400).send(err)
        })
    }catch(err){
        console.log(err)
        res.status(404).send({"Error":"Error in fetching status.Try Again!"})
    }
}
//To check whether the Express Route is avaialable or not
expressRouteAvailability= async(req,res) => {
    try{
        reqData = req.body
        authToken = req.header('Authorization')
        url = `https://management.azure.com/subscriptions/${reqData.subscriptionId}/resourceGroups/${reqData.resourceGroupName}/providers/Microsoft.Network/expressRouteCircuits/${reqData.circuitName}?api-version=2020-04-01`
        await getAvailability(url,authToken).then((results)=>{
            res.send(results)
        }).catch((err)=>{
            res.status(400).send(err)
        })
    }catch(err){
        console.log(err)
        res.status(404).send({"Error":"Error in fetching status.Try Again!"})
    }
}
//To check whether the s2s connection is available or not
sitetositeAvailability= async(req,res) => {
    try{
        reqData = req.body
        authToken = req.header('Authorization')
        url = `https://management.azure.com/subscriptions/${reqData.subscriptionId}/resourceGroups/${reqData.resourceGroupName}/providers/Microsoft.Network/connections/${reqData.virtualNetworkGatewayConnectionName}?api-version=2020-04-01`
        await getAvailability(url,authToken).then((results)=>{
            res.send(results)
        }).catch((err)=>{
            res.status(400).send(err)
        })
    }catch(err){
        console.log(err)
        res.status(404).send({"Error":"Error in fetching status.Try Again!"})
    }
}

module.exports = {getAvailability,vnetAvailability,firewallAvailability,vnetPeeringAvailability,publicIPAvailability,gatewayAvailability,expressRouteAvailability,sitetositeAvailability}
