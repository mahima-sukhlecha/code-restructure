require('dotenv').config();
var request = require('request');
//Name Availability for IPaas Component
function nameInfraAvailability(url,authToken,body){
    return new Promise((resolve,reject)=>{
        var options = {
            'method': 'POST',
            'url':url,
            'headers': {
                'Authorization': authToken,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        };
        request(options, function (error, response) { 
            if (!error && response.statusCode ==200){
                resolve(JSON.parse(response.body))
            }else if(!error && response.statusCode >=400){
                reject(JSON.parse(response.body))
            }else{
                reject({"Error":"Not Available"})
            }

    })
})
}
//get availability of iPaas components
function getInfraAvailability(url,authToken){
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
            if (!error && response.statusCode ==200){
                resolve(JSON.parse(response.body))
            }else if(!error && response.statusCode >=400){
                reject(JSON.parse(response.body))
            }else{
                reject({"Error":"Not Available"})
            }

    })
})
}
//APIM check Name Availability
APIMAvailability = async(req,res)=>{
    try{
        reqData = req.body
        body = {
            "name":reqData.name
        }
        authToken = req.header('Authorization')
        url = `https://management.azure.com/subscriptions/${reqData.subscriptionId}/providers/Microsoft.ApiManagement/checkNameAvailability?api-version=2019-12-01`
        await  nameInfraAvailability(url,authToken,body).then((results)=>{
            res.send(results)
        }).catch((err)=>{
            console.log("errr",err)
            res.status(400).send(err)
        })
    }catch(err){
        console.log(err)
        res.status(404).send({"Error":"Error in fetching status.Try Again!"})
    }

}
//Sites checkAvailability
sitesAvailability = async(req,res)=>{
    try{
        reqData = req.body
        authToken = req.header('Authorization')
        url = `https://management.azure.com/subscriptions/${reqData.subscriptionId}/resourceGroups/${reqData.resourceGroupName}/providers/Microsoft.Web/sites/${reqData.name}?api-version=2019-08-01`
        await getInfraAvailability(url,authToken).then((results)=>{
            res.send(results)
        }).catch((err)=>{
            console.log("errr",err)
            res.status(400).send(err)
        })
    }catch(err){
        console.log(err)
        res.status(404).send({"Error":"Error in fetching status.Try Again!"})
    }

}
//Sites check Name Availability
sitesNameAvailability = async(req,res)=>{
    try{
        reqData = req.body
        authToken = req.header('Authorization')
        body = {
            "name":reqData.name,
            "type": "site"
        }
        url = `https://management.azure.com/subscriptions/${reqData.subscriptionId}/providers/Microsoft.Web/checknameavailability?api-version=2019-08-01`
        await  nameInfraAvailability(url,authToken,body).then((results)=>{
            res.send(results)
        }).catch((err)=>{
            console.log("errr",err)
            res.status(400).send(err)
        })
    }catch(err){
        console.log(err)
        res.status(404).send({"Error":"Error in fetching status.Try Again!"})
    }

}
//Logic App checkAvailability
logicAppAvailability = async(req,res)=>{
    try{
        reqData = req.body
        authToken = req.header('Authorization')
        url = `https://management.azure.com/subscriptions/${reqData.subscriptionId}/resourceGroups/${reqData.resourceGroupName}/providers/Microsoft.Logic/workflows/${reqData.workflowName}?api-version=2016-06-01`
        await getInfraAvailability(url,authToken).then((results)=>{
            res.send(results)
        }).catch((err)=>{
            console.log("errr",err)
            res.status(400).send(err)
        })
    }catch(err){
        console.log(err)
        res.status(404).send({"Error":"Error in fetching status.Try Again!"})
    }

}

module.exports = {APIMAvailability,sitesAvailability,logicAppAvailability,sitesNameAvailability}