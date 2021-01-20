var request = require('request');
const { database } = require('./database')

//Create App Service Plan
async function appServicePlanAPI(data,token){
    return new Promise((resolve,reject)=>{
        try{
            var options = {
                'method': 'PUT',
                'url': `https://management.azure.com/subscriptions/${data.subscriptionId}/resourceGroups/${data.resourceGroupName}/providers/Microsoft.Web/serverfarms/${data.webAppName}?api-version=2019-08-01`,
                'headers': {
                  'Authorization': `${token}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({"location":`${data.location}` })              
            };
            request(options, async function (error, response) {
                if (!error && response.statusCode == 200){
                    resolve((JSON.parse(response.body)).id)  
                }else{
                    console.log("Error in App-Service-Plan API: ",response.body)
                    reject({"Error": JSON.parse(response.body)})  }
            });
        }catch(error) {
            console.log(error)
            reject({"Error": "Error occurred in try catch!!!"})
        }	        
    })
}

//Create Web App
async function webAppAPI(data,id,token){
    return new Promise((resolve,reject)=>{
        try{
            var options = {
                'method': 'PUT',
                'url': `https://management.azure.com/subscriptions/${data.subscriptionId}/resourceGroups/${data.resourceGroupName}/providers/Microsoft.Web/sites/${data.webAppName}?api-version=2019-08-01`,
                'headers': {
                    'Authorization': `${token}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({"location":`${data.location}`,"properties":{"serverFarmId":`${id}`}})
            };
            request(options, async function (error, response) {
                if (!error && response.statusCode == 200){
                    resolve({"Success": "Web App and App Service Plan Created."})
                }else{
                    console.log("Error in Web App API: ",response.body)
                    reject({"status": JSON.parse(response.body)})  }
            });

        }catch(error) { //Error occurred in try-catch
            console.log(error)
            reject({"status": "Error occurred in try catch!!!"})
        }	        
    })	
}

//Orchestration Function for creating Web App using App Service Plan ID
async function createWebApp(reqData,token) {
    return new Promise(async (resolve,reject)=>{
        try{ 
            await appServicePlanAPI(reqData,token).then(async id=>{     //App Service Plan
                await webAppAPI(reqData,id,token).then(async result=>{    //Web App
                    query = `UPDATE [dbo].[devOpsStarter] SET status = 'WebApp & AppServicePlan Created.' WHERE processId = '${reqData.processId}'`
                    databaseResponse = await database(query)
                    resolve(result)
                }).catch(error=>{ //Error occurred while creating Web App
                    reject(error)
                })
            }).catch(error=>{ //Error occurred while creating App Service Plan
                reject(error)
            })
         }catch(error) { //Error occurred in try-catch
            console.log(error)
            reject({"status": "Error in try-catch!!!"})
        }	          
    })
    
}

module.exports = {createWebApp}