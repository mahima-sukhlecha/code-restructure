var request = require('request');

async function getResourcesList(subscriptionId,authToken){
    return new Promise((resolve,reject)=>{
        var options = {
            'method': 'GET',
            'url':`https://management.azure.com/subscriptions/${subscriptionId}/resources?api-version=2019-10-01`,
            'headers': {
                'Authorization': authToken,
                'Content-type': 'application/json'
            },
        }
        request(options, function (error, response) {
            if (!error && response.statusCode === 200) {
                resolve({"statusCode":"200",
                    "body":JSON.parse(response.body)})
               
            }else if(!error && response.statusCode >= 400){
                resolve({"statusCode":"400",
                "body":JSON.parse(response.body)})
            }else {
                reject(error);
            }
        })

    })
    
   
}

exports.fetchResourcesList = async function (req,res){
    try{
    Promise.all(req.body.SubscriptionList.map(async function(subscription){
        authToken = req.header('Authorization')
        resourceList = await getResourcesList(subscription,authToken)
        if(resourceList.statusCode == "200"){
        return({"SubscriptionId":subscription,
        "resourceList": resourceList.body.value})}
    })).then(results=>{
        res.send(results)
    }).catch(err=>{
        res.send(err)
    })
}catch(err){
    res.status(404).send({"Error":"Error in getting results"})
}
}