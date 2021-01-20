var request = require('request');
const uuid  = require('uuid');

array =[] //array to store used Guid

//MS API to add role assignment for a particular user(principal id)
function getAddRoleAssignment(reqData,authToken,roleassignmentid){
    return new Promise((resolve,reject)=>{
        var options = {
        'method': 'PUT',
        'url': `https://management.azure.com/${reqData.scope}/providers/Microsoft.Authorization/roleAssignments/${roleassignmentid}?api-version=2015-07-01`,
        'headers': {
            'Authorization': authToken,
            'Content-Type': 'application/json'
    },
        body: JSON.stringify({"properties":{"roleDefinitionId":reqData.roleDefination,"principalId":reqData.principalId}})
    };
    try{
        request(options, function (error, response) {
            if (!error && (response.statusCode == 200 || response.statusCode == 201 ||response.statusCode == 202)){
                resolve(JSON.parse(response.body))
            }else if(!error && response.statusCode >= 400){
                reject(JSON.parse(response.body))
            }else{
                reject(error)
            }
        });
    }catch(err){
        console.log(err)
        reject(err)
    }
})

}
//Function to generate a unique guuid
function getuuid(){
    return new Promise((resolve,reject)=>{
        role = uuid.v4()
        if(array.includes(role)){
            getuuid()
        }else{
            array.push(role)
            resolve(role)
        }

    })
}
//Add role for a user by Global Admin 
exports.addRoleAssignment = async(req,res)=>{
    try{
        reqData = req.body
        authToken = req.header('Authorization')//User  AuthToken
        //Generate a unique ID
        await getuuid().then(async(roleID)=>{
            //Add Role Assignment having a unique Guuid
            await getAddRoleAssignment(reqData,authToken,roleID).then((addResponse)=>{
                res.send(addResponse)
            }).catch(err=>{ //Error in Adding roles
                res.status(400).send(err)
            })
        }).catch(err=>{ //error in fetching guid
            console.log(err)
            res.status(400).send({"Error":"Error in fetching guid.TryAgain!!"})
        })
        
        
    }catch(err){
        res.status(404).send({"Error":"Error in fetching Details.TryAgain!!"})   
    }

}