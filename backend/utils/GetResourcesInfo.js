var request = require('request');

async function getResources(RGinfo,authToken){
    return new Promise((resolve,reject)=>{
        var options = {
            'method': 'GET',
            'url':"https://management.azure.com/subscriptions/"+RGinfo.SubscriptionID+"/resourceGroups/"+RGinfo.resourceGroup+"/resources?api-version=2019-10-01",
            'headers': {
                'Authorization': authToken,
                'Content-type': 'application/json'
            },
        }
        request(options, function (error, response) {
            if (!error && response.statusCode == 200){
                resolve(JSON.parse(response.body))
            }else{
                reject({"error":"Error in getting info"})
            }
        })

    })


}

exports.fetchResources = async function (req,res){
    try{
        reqData = req.body
        authToken = req.header('Authorization')
        await getResources(reqData,authToken).then((data)=>{
            console.log('sending --->',data)
            res.send(data)
        }).catch(err=>{
            res.status(400).send({"Error":err})
        })

    }catch(err){
        res.status(404).send({"Error":"Forbidden"+err})
    }
}
