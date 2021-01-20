var request = require('request');
//Add Policy on a particular scope -given policyAssignmnet name
function getApplyPolicy(reqData,authToken){
    return new Promise((resolve,reject)=>{
        var options = {
            'method': 'PUT',
            'url': `https://management.azure.com/${reqData.scope}/providers/Microsoft.Authorization/policyAssignments/${reqData.policyAssignmentName}?api-version=2019-09-01 `,
            'headers': {
                'Authorization': authToken,
                'Content-Type': 'application/json'
      },
        body: JSON.stringify(reqData.body)
    
    };

    console.log(options)
    try{
        request(options, function (error, response) { 
            if (!error && (response.statusCode == 200 || response.statusCode == 201 || response.statusCode == 202)){
                resolve(JSON.parse(response.body))
            }else if(!error && response.statusCode >= 400){
                reject(JSON.parse(response.body))
            }else{
                reject(error)
            }
        });
    }catch(err){
        console.log("Error in Try catch",err)
        reject(err)
    }
    })

    
}
//Apply the requested the Policy on either subscription or RG using user Token
exports.applyPolicy= async(req,res) => {
    try{
        reqData = req.body
        authToken = req.header('Authorization')
        //MS API to Apply Policy
        await getApplyPolicy(reqData,authToken).then((results)=>{
            console.log("results---",results)
            res.send(results)
        }).catch((err)=>{
            console.log(err)
            res.status(400).send(err)
        })
    }catch(err){
        console.log(err)
        res.status(404).send({"Error":"Error in applying.Try Again!"})
    }
}
