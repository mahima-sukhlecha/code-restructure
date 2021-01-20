var request = require('request');
//MS DELETE API to delete the policy correspond to the policy assignment on a given scope 
function getDeletePolicy(req,authToken){
    return new Promise((resolve,reject)=>{
        var options = {
            'method': 'DELETE',
            'url': `https://management.azure.com/${req.query.scope}/providers/Microsoft.Authorization/policyAssignments/${req.params.policyAssignmentName}?api-version=2019-09-01`,
            'headers': {
                'Authorization': authToken
      }   
    };
    try{
        request(options, function (error, response) { 
            if (!error && response.statusCode == 200){
                resolve(JSON.parse(response.body))
            }else if(!error && response.statusCode >= 400){
                reject(JSON.parse(response.body))
            }else{
                reject(error)
            }
        });
    }catch(err){
        console.log("Error in Try-Catch",err)
        reject(err)
    }
    })    
}
//orchestrate the MS Delete Policy API
exports.deletePolicy= async(req,res) => {
    try{
        await getDeletePolicy(req,req.header('Authorization')).then((results)=>{
            console.log("results---",results)
            res.send(results)
        }).catch((err)=>{
            console.log(err)
            res.status(400).send(err)
        })
    }catch(err){
        console.log("Error in Try-Catch",err)
        res.status(404).send({"Error":"Error in applying.Try Again!"})
    }
}
