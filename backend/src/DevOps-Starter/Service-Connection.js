require('dotenv').config();
var request = require('request');
var {connectionBody} = require('./Service-Connection-body')
const credentials = require('../../utils/Credentials');
const { getProjectsAPI } = require('./Check-Organization');
const { database } = require('./database')

//Create Service Connection
async function serviceConnectionAPI(reqData,patToken,projectId,a3sId){
    return new Promise(async (resolve,reject)=>{

        const cred = await credentials.getcredentials(a3sId)
        var body = await connectionBody(reqData,cred,projectId)
        var options = {
            'method': 'POST',
            'url':`https://dev.azure.com/${reqData.organization}/_apis/serviceendpoint/endpoints?api-version=6.0-preview.4`,
            'headers': {
                'Authorization': "Basic " + Buffer.from(patToken+":"+patToken).toString("base64"),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        };
        request(options, function (error, response) { 
            if (!error && (response.statusCode == 200 || response.statusCode == 201 || response.statusCode == 202)){
                resolve({"servicePrincipleID":(JSON.parse(response.body)).id})
            }else if (!error && response.statusCode>=400){
                reject(JSON.parse(response.body))
            }else{
                reject({"Error":"Error in service Connection"})
            }

    })
})
}

async function serviceConnection(reqData,patToken,a3sId) {
    return new Promise(async (resolve,reject)=>{
        var projectName = reqData.project

        await getProjectsAPI(reqData.organization,patToken).then(async results=>{
            results.forEach(async element => {
                if(element.name=== projectName){    //Project name found=> Project created
                    var projectId= element.id

                    await serviceConnectionAPI(reqData,patToken,projectId,a3sId).then(async result=>{
                        console.log('Service Principle successfully created.')
                        query = `UPDATE [dbo].[devOpsStarter] SET status = 'Service Connection Created Successfully.' WHERE processId = '${reqData.processId}'`
                        databaseResponse = await database(query)
                        resolve(result)
                    }).catch(error=>{ //Error while creating service connection
                        reject(error)    
                    })                
                }
            });  //for-Each ends

        }).catch(error=>{ //Error while getting Project List
            reject(error)     
        })
    })     
}

module.exports = { serviceConnection }