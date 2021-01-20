require('dotenv').config();
var request = require('request');


function getAvailability(url,strAccName,authToken){
    return new Promise((resolve,reject)=>{
        var options = {
            'method': 'POST',
            'url':url,
            'headers': {
                'Authorization': authToken,
                'Content-Type': 'application/json'
            },

		body: JSON.stringify({
			"name":strAccName,
			"type":"Microsoft.Storage/storageAccounts"})
        }

        request(options, function (error, response) {
            if (!error && response.statusCode ==200){
                resolve(JSON.parse(response.body))
            }else{
                reject({"Error":error})
            }

    })
})
}
function getExistence(reqData,authToken){
    return new Promise((resolve,reject)=>{
        var options = {
            'method': 'GET',
            'url':`https://management.azure.com/subscriptions/${reqData.subscriptionId}/resourceGroups/${reqData.Resource_Group}/providers/Microsoft.DataFactory/factories/${reqData.datafactory}?api-version=2018-06-01`,
            'headers': {
                'Authorization': authToken,
                'Content-Type': 'application/json'
            }
        };
        request(options, function (error, response) {
            if (!error && response.statusCode == 200){
                resolve(JSON.parse(response.body))
            }else{
                reject({"Error":"Not Available"})
            }

    })
})
}


storageAvailability= async(req,res) => {
    reqData = req.body
    try{
        reqData = req.body
        authToken = req.header('Authorization')
        url = `https://management.azure.com/subscriptions/${reqData.subscriptionId}/providers/Microsoft.Storage/checkNameAvailability?api-version=2019-06-01`
        await getAvailability(url,reqData.strAccName,authToken).then((results)=>{
            console.log("results---",results)
            res.send(results)
        }).catch((err)=>{
            res.status(400).send(err)
        })
    }catch(err){
        console.log(err)
        res.status(404).send({"Error":"Error in fetching status.Try Again!"})
    }
}

sqlserverAvailability= async(req,res) => {
    try{
        reqData = req.body
        authToken = req.header('Authorization')
        url = `https://management.azure.com/subscriptions/${reqData.subscriptionId}/providers/Microsoft.Sql/checkNameAvailability?api-version=2014-04-01`
        await getAvailability(url,"Microsoft.Sql/servers",reqData.sqlServerName,authToken).then((results)=>{
            console.log("results---",results)
            res.send(results)
        }).catch((err)=>{
            res.status(404).send(err)
        })
    }catch(err){
        console.log(err)
        res.status(400).send({"Error":"Error in fetching status.Try Again!"})
    }
}

ADFExistence= async(req,res) => {
    try{
        reqData = req.body
        authToken = req.header('Authorization')
        await getExistence(reqData,authToken).then((results)=>{
            console.log("results---",results)
            res.send({"status":"Success"})
        }).catch((err)=>{
            res.status(400).send({"status":"Failure"})
        })
    }catch(err){
        console.log(err)
        res.status(404).send({"Error":"Error in fetching status.Try Again!"})
    }
}

module.exports = {storageAvailability,sqlserverAvailability,ADFExistence}
