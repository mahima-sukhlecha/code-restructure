var authentication = require("../../utils/access_token")
const credentials = require('../../utils/Credentials')
const common = require('../../utils/common');
var arryRoleAssignment =[]
//Orchestrate each subscription to get the list of role assignments
async function forEachSubscription(userObjectId,subscriptionList,authToken){
    return new Promise((resolve,reject)=>{
        Promise.all(subscriptionList.map(async function(element){
            roleAssignment = await forRoleAssignment(element,userObjectId,authToken)
            
            return(roleAssignment)
        })).then(results =>{
            resolve(arryRoleAssignment)
        }).catch(err=>{
            console.log(err)
            reject(err)
        })
    })
}

async function forRoleAssignment(subscription,userObjectId,authToken){
    return new Promise(async(resolve,reject)=>{
        bodyRoleAssignment = await common.getRequest("https://management.azure.com/subscriptions/" + subscription + "/providers/Microsoft.Authorization/roleAssignments?api-version=2015-07-01", authToken)
        var roleAssignment = JSON.parse(bodyRoleAssignment)
        Promise.all(roleAssignment.value.map(async function (element){
            var elementRoleDefination = element.properties.roleDefinitionId.split("/").pop()
            if (element.properties.principalId === userObjectId && (elementRoleDefination === "b24988ac-6180-42a0-ab88-20f7382dd24c" || elementRoleDefination === "8e3af657-a8ff-443c-a75c-2fe8c4bcb635" || elementRoleDefination === "acdd72a7-3385-48ef-bd42-f606fba81ae7")) {    
                if(elementRoleDefination === "b24988ac-6180-42a0-ab88-20f7382dd24c"){
                    arryRoleAssignment.push({
                        "RoleDefination":"Contributor",
                        "name":element.name,
                        "scope":element.properties.scope,
                        "objectId":userObjectId
                    })
                }else if(elementRoleDefination === "8e3af657-a8ff-443c-a75c-2fe8c4bcb635"){
                    arryRoleAssignment.push({
                        "RoleDefination":"Owner",
                        "name":element.name,
                        "scope":element.properties.scope,
                        "objectId":userObjectId
                    })
                }else if(elementRoleDefination === "acdd72a7-3385-48ef-bd42-f606fba81ae7"){
                    arryRoleAssignment.push({
                        "RoleDefination":"Reader",
                        "name":element.name,
                        "scope":element.properties.scope,
                        "objectId":userObjectId
                    })
                }
               
            }
            return(element.properties.principalId)
        })).then((results)=>{
            //console.log("results----->",results)
            resolve(results)
        }).catch(err=>{
            console.log("error-------------------------->",error)
            resolve(err)
        })

    })
}
//Getting roles over that subscriptions for a particular user
exports.forEachUser = async(req,res)=>{
    try{
        arryRoleAssignment =[]
        userObjectId = req.body.ObjectID
        subscriptionList = req.body.SubscriptionList // List of all subs that application can access
        await credentials.getcredentials(req.header('id')).then(async(cred)=>{
            await authentication.clientCredAuthenticationForMsManagementApi(cred).then(async(resToken)=>{
                authResponse = resToken
                await forEachSubscription(userObjectId,subscriptionList,authResponse["access_token"]).then(async(roleAssignedResponse)=>{
                    res.send(roleAssignedResponse)
                }).catch(err=>{
                    console.log(err)
                    res.status(400).send(err)
                })
            }).catch(err=>{
                console.log(err)
                res.status(400).send({"Error":"Error in getting Token from Credentials. Please Try with correct A3S-ID"})
            })     
        }).catch(err=>{
            console.log(err)
            res.status(400).send({"Error":"Error in getting Credentials. Please Try with correct A3S-ID"})
        })
    }catch(error){
        console.log(error)
        res.status(404).send({"Error":"Error in getting response.Please TRY again!!"})
    }
}