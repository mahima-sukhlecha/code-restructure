var request = require('request');
const { database } = require('./database')

//Get list of Repositories
async function getRepositoriesAPI(data,patToken){
    return new Promise((resolve,reject)=>{
        try{
            var options = {
                'method': 'GET',
                'url': `https://dev.azure.com/${data.organization}/${data.project}/_apis/git/repositories?api-version=5.1`,
                'headers': {
                    'Authorization': "Basic " + Buffer.from(patToken+":"+patToken).toString("base64")
                }
            };
            request(options, async function (error, response) { 
                if (!error && response.statusCode == 200){
                    resolve((JSON.parse(response.body)).value[0].id)  
                }else{
                    console.log("Error in get Repositories List API: ",JSON.parse(response.body))
                    reject({"Error": JSON.parse(response.body)})  }
            });
        }catch(error) { //Error occurred in try-catch block
            console.log(error)
            reject({"Error": "Error occurred in try catch!!!"})
        }	        
    })
}

//Create Project of given org-name,project-name,project-description,etc
async function pushCodeToAzureRepo(data,projectId,patToken){ 
    return new Promise((resolve,reject)=>{
        try{
            var options = {
                'method': 'POST',
                'url': `https://dev.azure.com/${data.organization}/${data.project}/_apis/git/repositories/${projectId}/importRequests?api-version=6.0-preview.1`,
                'headers': {
                    'Authorization': "Basic " + Buffer.from(patToken+":"+patToken).toString("base64"),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "parameters":{
                        "gitSource":{
                            "url": "https://mahimaAuto@dev.azure.com/mahimaAuto/Publicrepo/_git/Publicrepo" }
                    }})
            };           
                request(options, async function (error, response) { 
                if (!error && response.statusCode == 201){
                    resolve({"Success": "Code pushed to Azure Repos successfully..!!!"})  
                }else{
                    console.log("Error in code pushed to repository API: ",JSON.parse(response.body))
                    reject({"Error": JSON.parse(response.body)})  }
            });


        }catch(error) { //Error occurred in try-catch block
            console.log(error)
            reject({"Error": "Error occurred in try catch!!!"})
        }	        
    })
}

//Push code of given url into the repository of created project.
async function pushCodeToRepository(reqData,patToken) {
    return new Promise(async (resolve,reject)=>{
        try{
            await getRepositoriesAPI(reqData,patToken).then(async projectId=>{

                await pushCodeToAzureRepo(reqData,projectId,patToken).then(async resultant=>{    //Push Code
                    query = `UPDATE [dbo].[devOpsStarter] SET status = 'Import Code To Repository Succeeded.' WHERE processId ='${reqData.processId}'`
                    databaseResponse = await database(query)
                    resolve(resultant)
                }).catch(error=>{  //Error while push the code on Azure Repos.
                    reject(error)    
                })
                
            }).catch(error=>{  //Error while getting repositories list.
                reject(error)    
            })
        }catch(error) { //Error occurred in try-catch block
            console.log(error)
            reject({"Error": "Error occurred in try catch!!!"})
        }	 
    })

}

module.exports = {pushCodeToRepository}