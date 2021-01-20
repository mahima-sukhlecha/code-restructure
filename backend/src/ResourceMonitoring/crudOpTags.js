require('dotenv').config();
var request = require('request');


function implementTags(reqData,authToken){
    return new Promise((resolve,reject)=>{
        var options = {
            'method': 'PUT',
            'url':`https://management.azure.com/${reqData.scope}/providers/Microsoft.Resources/tags/default?api-version=2019-10-01`,
            'headers': {
                'Authorization': authToken,
                'Content-Type': 'application/json'
            },
            body:JSON.stringify(reqData.body)
            

        };
        console.log(options)
        request(options, function (error, response) {
            if (!error && response.statusCode == 200){
                resolve({
                    "status":response.statusCode,
                    "body":JSON.parse(response.body)
                })
            }else if(!error && response.statusCode >=400){
                reject({
                    "status":response.statusCode,
                    "body":JSON.parse(response.body)
                })
            }
            else{
                reject({"Error":"Not Available"})
            }

    })
})
}

exports.crudOperationOnTags = async(req,res)=>{
    try{
        reqData = req.body
        authToken = req.header('Authorization')
        await implementTags(reqData,authToken).then(results=>{
            res.send(results)
        }).catch(err=>{
            console.log("error in tags implemetation--> ",err)
            res.status(400).send(err)
        })
    }catch(err){
        res.status(404).send({"Error":"Error in getting response"})
    }
}