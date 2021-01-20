var request = require('request');
const { getProjectsAPI } = require('./Check-Organization');
const { database } = require('./database')

//Delete Project of given org-name and project-name
async function deleteProjectAPI(organization,projectId,patToken){
    return new Promise((resolve,reject)=>{
        try{
            var options = {
                'method': 'DELETE',
                'url': `https://dev.azure.com/${organization}/_apis/projects/${projectId}?api-version=6.1-preview.4`,
                'headers': {
                    'Authorization': "Basic " + Buffer.from(patToken+":"+patToken).toString("base64") }
                };          
                request(options, async function (error, response) { 
                if (!error && (response.statusCode == 200 || response.statusCode == 202)){
                    resolve({"Success":"Project successfully deleted."})
                }else{
                    console.log("Error in delete Project API: ",JSON.parse(response.body))
                    reject({"Error": JSON.parse(response.body).message})  }
            });

        }catch(error) { //Error in try-catch block
            console.log(error)
            reject({"Error": "Error occurred in try catch!!!"})
        }	        
    })
}

//Delete Project
exports.deleteProject= async(req,res)=> {
    try{    
        var reqData = req.body
        var organization = reqData.organization
        var patToken = reqData.patToken
        var project = reqData.project
        
       await getProjectsAPI(organization,patToken).then(async values=>{
           values.forEach(async value => {
               if(value.name === project){ //"value.id" ---> "project Id"
                    
               await deleteProjectAPI(organization,value.id,patToken).then(async result=>{ //delete from devOps portal
                        query = `DELETE FROM [dbo].[devOpsStarter] WHERE organization='${organization}' AND project='${project}' AND a3sId='${req.headers.id}'` 
                        
                        await database(query).then(result1=>{ //delete from database
                            res.send(result)
                        }).catch(error=>{  //Error while deleting from database 
                            console.log("Database Error: ",error)
                            res.status(400).send({"Database Error":error}) 
                        })

                    }).catch(error=>{  //Error occurred while deleting from devOps portal
                        res.status(400).send(error) 
                    })
                }

           });          
       }).catch(error=>{ //Error occurred while getting project list
           console.log("Error while getting Projects List: ",error)
           res.status(400).send({"Error":error}) 
       })                 
    }catch(error){ //Error in try-catch block 
        console.log("Error: ",error)
        reject({"Error": "Error occurred in try catch!!!"})  
    }

}