require('dotenv').config();
var request = require('request');
const credentials = require('../../utils/Credentials')
const authentication = require('../../utils/access_token')
const { reject } = require('promise');
const Parallel = require('async-parallel')

var roleAssignment; //Array storing the getRoleAssignmentDataFromApi API data


//Get Role Assignments Data of a particular subscription from API (PrincipalId,Scope,etc.)
async function getRoleAssignmentDataFromApi(req){
    try{
        var token = req.headers.authorization
        return new Promise((resolve,reject)=>{
            var options = {
                'method': 'GET',
                'url': `https://management.azure.com/subscriptions/${req.params.subscriptionId}/providers/Microsoft.Authorization/roleAssignments?api-version=2015-07-01`,
                'headers': {  'Authorization': `${token}`  }
            }
            request(options, async function (error, response) { 
                if (!error && response.statusCode === 200){
                    resolve(JSON.parse(response.body))
                }else{
                    reject({"status":JSON.parse(response.body)})    }
            });
        })
    }catch(error) {
        console.log(error)
        res.status(404).send({"status": "Error occurred..!!! Please try again."})
    } 	
}

//Get User Data with user's PrincipalId from Graph API (DisplayName,mail,etc.)
async function getUserData(principalId,token){
    try{
        return new Promise((resolve,reject)=>{
            var options = {
                'method': 'GET',
                'url':`https://graph.microsoft.com/v1.0/users/${principalId}`,
                'headers': {  'Authorization': `Bearer ${token}`  }
            }
            request(options, async function (error, response) { 
                if (!error && response.statusCode === 200){
                    resolve(JSON.parse(response.body))
                }else{
                    resolve({"service-principal":JSON.parse(response.body)}) }
            });
        })
    }catch(error) {
        console.log(error)
        res.status(404).send({"status": "Error occurred..!!! Please try again."})
    } 	
}

//Get User Data with service-principal's PrincipalId from Graph API (DisplayName,mail,etc.)
async function getServicePrincipalData(principalId,token){
    try{
        return new Promise((resolve,reject)=>{
            var options = {
                'method': 'GET',
                'url':`https://graph.microsoft.com/v1.0/servicePrincipals/${principalId}`,
                'headers': {  'Authorization': `Bearer ${token}`  }
            }
            request(options, async function (error, response) { 
                if (!error && response.statusCode === 200){
                    resolve(JSON.parse(response.body))
                }else{
                    reject({"Error":JSON.parse(response.body)})   }
            });
        })
    }catch(error) {
        console.log(error)
        res.status(404).send({"status": "Error occurred..!!! Please try again."})
    } 	
}

//Get RoleAssignment and Token for Graph API
async function getToken(req,a3sId){
    try{
        return new Promise(async (resolve,reject)=>{
            await getRoleAssignmentDataFromApi(req).then(async result=>{
                if(result.value && (result.value).length>0){
                    roleAssignment = result.value                   //roleAssignment
                    await credentials.getcredentials(a3sId).then(async cred=>{   //clientId,clientSecret,tenantId
                        await authentication.clientCredAuthenticationForMsGraphApi(cred).then(token=>{  //token
                            resolve((token).access_token)
                        }).catch(error=>{
                            reject(error)  })
                    }).catch(error=>{
                        reject(error)    })
                }else{  //If roleAssignment.value===[]
                    reject({"status":"No Role Assignments data found in this Subscription!! Please try again..!!!"}) }                
            }).catch(error=>{
                console.log("Error occurred: ",error)
                reject(error)
            })              
        })
    }catch(error) {
        console.log(error)
        res.status(404).send({"status": "Error occurred..!!! Please try again."})
    }
}

//Get Role Assignments List
async function listRoleAssignment(req,res){
    
    try{
        var a3sId = req.headers.id;
        var resultant=[]

        await getToken(req,a3sId).then(async graphApiToken=>{  //token
            await Parallel.each(roleAssignment,(async function (element){       //forEach loop
                var elementRoleDefination = element.properties.roleDefinitionId.split("/").pop()
                var principalId = element.properties.principalId

                if (principalId && (elementRoleDefination === "b24988ac-6180-42a0-ab88-20f7382dd24c" || elementRoleDefination === "8e3af657-a8ff-443c-a75c-2fe8c4bcb635" ||  elementRoleDefination === "acdd72a7-3385-48ef-bd42-f606fba81ae7")) {    
                    
                    await getUserData(principalId, graphApiToken).then(async userData=>{
                        var name, email;
                        
                        if(userData["service-principal"]){ //If Error occurs while hitting User's Data API => It's a Service Principle
                            await getServicePrincipalData(principalId,graphApiToken).then(servicePrincipalData=>{
                                name = servicePrincipalData.displayName 
                                email = null  //Service Principle don't have email ID

                            }).catch(error=>{  //Error occurred while hitting Service Principle API
                                console.log("Error occurred in getting servicePrincipal data: ",error)   })
                        }else{
                            name = userData.displayName
                            email = userData.mail    
                        }     

                        if(elementRoleDefination === "b24988ac-6180-42a0-ab88-20f7382dd24c"){
                            resultant.push({
                                "Role":"Contributor",
                                "PrincipalId":principalId,
                                "Name":name,
                                "EmailID":email,
                                "Scope":element.properties.scope
                            })
                        }else if(elementRoleDefination === "8e3af657-a8ff-443c-a75c-2fe8c4bcb635"){
                            resultant.push({
                                "Role":"Owner",
                                "PrincipalId":principalId,
                                "Name":name,
                                "EmailID":email,
                                "Scope":element.properties.scope
                            })
                        }else if(elementRoleDefination === "acdd72a7-3385-48ef-bd42-f606fba81ae7"){
                            resultant.push({
                                "Role":"Reader",
                                "PrincipalId":principalId,
                                "Name":name,
                                "EmailID":email,
                                "Scope":element.properties.scope
                            })
                        }                                            
                    }).catch(error=>{ //Error occurred while hitting User Data API     
                        reject(error)  })                                 
                }                                                         
            })).then(results=>{
                res.send(resultant)
            }).catch(error=>{  //Error occurred in Parallel.each loop 
                console.log("Error occurred: ",error)
                res.status(400).send(error)
            })

        }).catch(error=>{   //Error occurred while getting token     
            res.status(401).send(error)  })                 

    }catch(error) {  //Error occurred in try block
        console.log(error)
        res.status(404).send({"status": "Error occurred..!!! Please try again."})
    } 	
}

module.exports = {listRoleAssignment}