require('dotenv').config();
var request = require('request');

function getToken(url,authToken){
    return new Promise((resolve,reject)=>{
        var options = {
            'method': 'POST',
            'url':url,
            'headers': {
                'Authorization': authToken,
                'Content-Type': 'application/json'
            }
        };
        request(options, function (error, response) {
            console.log(response.body)
            if (!error && response.statusCode ==200){
                resolve(JSON.parse(response.body))
            }else{
                reject({"Error":"Not Available"})
            }

    })
})
}
//get runtime keys for creating link service(after creation of ADF)
exports.runtimeKeys= async(req,res) => {
    try{
        reqData = req.body
        authToken = req.header('Authorization')
        url = `https://management.azure.com/subscriptions/${reqData.subscriptionId}/resourceGroups/${reqData.Resource_Group}/providers/Microsoft.DataFactory/factories/${reqData.datafactory}/integrationRuntimes/integrationRuntime1/listAuthKeys?api-version=2018-06-01`
        await getToken(url,authToken).then((results)=>{
            res.send({"authKey1":results.authKey1})
        }).catch((err)=>{
            res.status(400).send(err)
        })
    }catch(err){
        console.log(err)
        res.status(404).send({"Error":"Error in fetching Tokens.Try Again!"})
    }
}
//Storage account keys(after storage account get successfully deployed) 
exports.storageAccountKeys= async(req,res) => {
    try{
        reqData = req.body
        authToken = req.header('Authorization')
        url = `https://management.azure.com/subscriptions/${reqData.subscriptionId}/resourceGroups/${reqData.Resource_Group}/providers/Microsoft.Storage/storageAccounts/${reqData.strAccount}/listKeys?api-version=2019-06-01`
        await getToken(url,authToken).then((results)=>{
            res.send({
                "AccessKey":results.keys[0].value,
                "ConnectionString":`DefaultEndpointsProtocol=https;AccountName=${reqData.strAccount};AccountKey=${results.keys[0].value};EndpointSuffix=core.windows.net`
            })
        }).catch((err)=>{
            res.status(400).send(err)
        })
    }catch(err){
        console.log(err)
        res.status(404).send({"Error":"Error in fetching Tokens.Try Again!"})
    }
}


