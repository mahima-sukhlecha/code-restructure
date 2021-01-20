var request = require('request');

//MS API to delete roles 
function getDeleteAssignment(req,authToken){
    return new Promise((resolve,reject)=>{
        var options = {
            'method': 'DELETE',
            'url': `https://management.azure.com/${req.query.scope}/providers/Microsoft.Authorization/roleAssignments/${req.params.roleAssignmentName}?api-version=2015-07-01`,
            'headers': {
                'Authorization': authToken
            }
        };
        request(options, function (error, response){
            if(!error && response.statusCode == 200){
                resolve({"Response":"Deleted"})
            }else if (!error && response.statusCode == 204){
                resolve({"Response":" Already Deleted"})
            }else if(!error && response.statusCode >= 400){
                reject(JSON.parse(response.body))
            }else{
                reject(error)
            }
        });
    })
}
// Delete Role Assignment correspond to the roleassignment ID in request
exports.deleteRoleAssignment = async(req,res)=>{
    try{
        await getDeleteAssignment(req,req.header('Authorization')).then(deleteResponse=>{
            res.send(deleteResponse)
        }).catch(err=>{
            console.log(err)
            res.status(400).send(err)
        })
    }catch(err){
        console.log(err)
        res.status(404).send({"Error":"Please Try Again"})
    }
}

//module.exports={deleteRoleAssignment}
