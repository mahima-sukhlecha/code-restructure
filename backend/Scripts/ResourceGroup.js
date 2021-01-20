require('dotenv').config();
var request = require('request');


async function common(url,body,authToken){
    return new Promise((resolve,reject)=>{
        var options = {
            'method': 'PUT',
            'url':url,
            'headers': {
                'Authorization': authToken,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)

        };
        console.log("-------common ----")

        request(options, function (error, response) {
            if (!error && response.statusCode >= 200){
                console.log("---------->"+reqData.userId)
                resolve({
                    "statusCode" : response.statusCode,
                    "body" : JSON.parse(response.body)
                })
            }else if(!error && response.statusCode >= 400){
              console.log("---------->"+reqData.userId)
              console.log(response.statusCode)
              console.log(response.body)
              reject(response.body)
          }else{
            reject(error)
          }

    })
})
}

exports.resourceGroupOrchestration = async(req)=>{
    return new Promise(async(resolve,reject)=>{
        try{      
            reqData = req.body
            authToken = req.header('Authorization') 
            RGURI = `https://management.azure.com/subscriptions/${reqData.subscriptionID}/resourceGroups/${reqData.ResourceGroup}/?api-version=2019-05-01 `
            RGBody = { 
                "location": reqData.location, 
            }
            await common(RGURI,RGBody,authToken).then((results)=>{
                resolve(results)
            }).catch(err=>{
                console.log("--- RG"+err)
                reject({"Error" : err})
            })
            
        }catch(err){
            console.log("in try catch")
            reject(err)
            
        }
    })
}




















