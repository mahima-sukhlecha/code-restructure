var request = require('request');
const { database } = require('./database')

//Craete Project (of given org-name,project-name,project-description,etc.)
async function createProjectAPI(data,typeId,patToken){
    return new Promise((resolve,reject)=>{
        try{
            var options = {
                'method': 'POST',
                'url': `https://dev.azure.com/${data.organization}/_apis/projects?api-version=6.0-preview.4`,
                'headers': {
                    'Authorization': "Basic " + Buffer.from(patToken+":"+patToken).toString("base64"),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({"name":data.project,"description":data.projectDescription,"capabilities":{"versioncontrol":{"sourceControlType":"Git"},"processTemplate":{"templateTypeId":typeId}},"visibility":data.visibility})            };
           

                request(options, async function (error, response) { 
                if (!error && (response.statusCode == 200 || response.statusCode == 202)){
                    resolve({"Success":"Project successfully creating..!!!"})
                }else{
                    console.log("Error in create Project API: ",JSON.parse(response.body))
                    reject({"Error": JSON.parse(response.body).message})  }
            });

        }catch(error) {
            console.log(error)
            reject({"Error": "Error occurred in try catch!!!"})
        }	        
    })

}

//Create Project
async function createProject(reqData,patToken) {
    return new Promise(async(resolve,reject)=>{
        try{    
            var process = reqData.process
            if(process==='Scrum'){
                var processTypeId = "6b724908-ef14-45cf-84f8-768b5384da45"
            }else if(process==='Basic'){
                var processTypeId = "b8a3a935-7e91-48b8-a94c-606d37c3e9f2"
            }else if(process==='Agile'){
                var processTypeId = "adcc42ab-9882-485e-a3ed-7678f01f66bc"
            }else if(process==='CMMI'){
                var processTypeId = "27450541-8e31-4150-9947-dc59f998fc01" }
        
            await createProjectAPI(reqData,processTypeId,patToken).then(async result=>{
                query = `UPDATE [dbo].[devOpsStarter] SET status = 'Project Creation In Progress.' WHERE processId = '${reqData.processId}'`
                databaseResponse = await database(query)
                resolve(result)
            }).catch(error=>{
                reject(error)
            })
            
        }catch(error) {
            console.log("Error: ",error)
            reject({"Error": "Error occurred in try catch!!!"})  }	   
    })

}

module.exports = {createProject}