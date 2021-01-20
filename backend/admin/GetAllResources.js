const common = require('./common');
//const { reject } = require('promise');
var arryRoleAssignment = []
var authTokenRG;
var userObjectId;
var deleteArray =[]
async function ListSubscription() {
    return new Promise(async function (resolve, reject) {
        bodySubscription = await common.getRequest("https://management.azure.com/subscriptions?api-version=2016-06-01", token)
        var subscriptionsList = JSON.parse(bodySubscription);
        //console.log("subscription---->",subscriptionsList)
        Promise.all(subscriptionsList.value.map(async function(elementSubscription){
            roleAssignment  = await listRoleAssignment(elementSubscription)
            return(roleAssignment)
        })).then(results=>{
            //console.log("arraylogassignment",arryRoleAssignment)
            resolve(arryRoleAssignment)
        }).catch(err=>{
            console.log("error------------->",err)
            reject(err)
        })
        
            
    })
} 

async function listRoleAssignment(elementSubscription){
    return new Promise(async(resolve,reject)=>{
        //start roleassignmet
        bodyRoleAssignment = await common.getRequest("https://management.azure.com/subscriptions/" + elementSubscription.subscriptionId + "/providers/Microsoft.Authorization/roleAssignments?api-version=2015-07-01", token)
        var roleAssignment = JSON.parse(bodyRoleAssignment)
        Promise.all(roleAssignment.value.map(async function (element){
            var elementRoleDefination = element.properties.roleDefinitionId.split("/").pop()
            if (element.properties.principalId === userObjectId && (elementRoleDefination === "b24988ac-6180-42a0-ab88-20f7382dd24c" || elementRoleDefination === "8e3af657-a8ff-443c-a75c-2fe8c4bcb635" ||  elementRoleDefination === "acdd72a7-3385-48ef-bd42-f606fba81ae7")) {    
                if(elementRoleDefination === "b24988ac-6180-42a0-ab88-20f7382dd24c"){
                    arryRoleAssignment.push({
                        "Role":"Contributor",
                        "SubscriptionID":elementSubscription.subscriptionId,
                        "SubscriptionName":elementSubscription.displayName,
                        "state":elementSubscription.state,
                        "scope":element.properties.scope
                    })
                }else if(elementRoleDefination === "8e3af657-a8ff-443c-a75c-2fe8c4bcb635"){
                    arryRoleAssignment.push({
                        "Role":"Owner",
                        "SubscriptionID":elementSubscription.subscriptionId,
                        "SubscriptionName":elementSubscription.displayName,
                        "state":elementSubscription.state,
                        "scope":element.properties.scope
                    })
                }else if(elementRoleDefination === "acdd72a7-3385-48ef-bd42-f606fba81ae7"){
                    arryRoleAssignment.push({
                        "Role":"Reader",
                        "SubscriptionID":elementSubscription.subscriptionId,
                        "SubscriptionName":elementSubscription.displayName,
                        "state":elementSubscription.state,
                        "scope":element.properties.scope
                    })
                }
            }
            return({ "SubscriptionID":elementSubscription.subscriptionId})
        })).then((results)=>{
            //console.log("results----->",results)
            resolve(results)
        }).catch(err=>{
            console.log("error-------------------------->",error)
            reject(err)
        })
    })
}   
            
async function getSubscriptionList(){
    return new Promise((resolve,reject)=>{
        if (arryRoleAssignment.length > 0) {
            //const distinctSubscription = [... new Set(arryRoleAssignment)]
            Promise.all (arryRoleAssignment.map(async elementSubscription=>{
                var arryResourceGroup = []
                var scope = elementSubscription.scope.split("/").pop()
                if(scope == elementSubscription.SubscriptionID){
                    bodyResourcegroup = await common.getRequest("https://management.azure.com/subscriptions/" + elementSubscription.SubscriptionID + "/resourcegroups?api-version=2019-10-01", authTokenRG)
                    var resourceGroup = JSON.parse(bodyResourcegroup);
                    resourceGroup.value.forEach(element => {
                        
                        arryResourceGroup.push({"Name":element.name,"Location":element.location});
                    });
                }else{
                    var scopeRG = elementSubscription.scope.split("/")
        
                    bodyResourcegroup = await common.getRequest("https://management.azure.com/subscriptions/" + elementSubscription.SubscriptionID + "/resourcegroups/" + scopeRG[4] + "?api-version=2019-10-01", authTokenRG)
                    var resourceGroup = JSON.parse(bodyResourcegroup)
                    
                    arryResourceGroup.push({"Name":resourceGroup.name,"Location":resourceGroup.location});
                }
                return({ 'Role':elementSubscription.Role ,'SubscriptionID': elementSubscription.SubscriptionID,'SubscriptionName':elementSubscription.SubscriptionName, 'ResourceGroups': arryResourceGroup, 'Scope': elementSubscription.scope, 'State':elementSubscription.state })
            })).then((results)=>{
                resolve(results)
            }).catch(err=>{
                reject(err)
            })
  
        }
        else {
            reject({ 'Error': 'You dont have access' });
        }
    })

}

function getRGList(arrayOfJson){
    return new Promise((resolve,reject)=>{
        deleteArray =[]
        for(j = 0;j<arrayOfJson.length;j++){
            for(i = j+1; i<arrayOfJson.length;i++){
        
                if(arrayOfJson[j].SubscriptionID == arrayOfJson[i].SubscriptionID && arrayOfJson[j].Role == arrayOfJson[i].Role){
                    if(deleteArray.indexOf(arrayOfJson[i]) == -1){
                    rglist = arrayOfJson[j].ResourceGroups.concat(arrayOfJson[i].ResourceGroups)
                    //console.log('rglist---->',rglist)
                    //distintrglist = [... new Set(rglist)]
                    arrayOfJson[j].ResourceGroups  = rglist
                    deleteArray.push(arrayOfJson[i])
                    //console.log(arrayOfJson[j])
                }
            }
        
            }
        resolve(arrayOfJson)

    }
})
    

}

function subscriptionOrchestration(authToken, ObjectId,tokenRG,userName){
    token = authToken
    userObjectId = ObjectId
    authTokenRG = tokenRG
    arryRoleAssignment = []
    return new Promise((resolve,reject)=>{
        ListSubscription().then((listSub)=>{
            getSubscriptionList().then((requiredList)=>{
                getRGList(requiredList).then((responseList)=>{
                    result = responseList.filter(n => !deleteArray.includes(n))
                    console.log("--->",result)
                    resolve({"userName": userName,
                "Subscription_RGList":result})

                }).catch((err)=>{
                    console.log("--->",err)
                    reject({"userName": userName})
                })   
            //     const distinctrequiredList = [... new Set(requiredList)]
            //     resolve({"userName": userName,
            //     "Subscription_RGList":distinctrequiredList})
            }).catch((err)=>{
                console.log("--->",err)
                resolve({"userName": userName})
            })   
        }).catch(err=>{
            console.log("--->",err)
            reject({"userName": userName})
        })
    })
}

module.exports =
{
    subscriptionOrchestration
}