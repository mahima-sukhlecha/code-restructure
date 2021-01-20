require('dotenv').config();
var request = require('request');
var {getReleaseBody} = require('./Release-body')
var {database} = require('./database')
var {runPipelineCommon,getPipelineDetails} = require('./Pipeline-Common')


//Creating Build Pipeline
releasePipeline= async(reqData,authToken,buildresponse,connectionServiceName) => {
    return new Promise(async(resolve,reject)=>{
    try{
        userEntitlementsURI = `https://vsaex.dev.azure.com/${reqData.organization}/_apis/userentitlements?api-version=5.1-preview.2`
        //Get User details from userEntitlements REST API
        await getPipelineDetails(userEntitlementsURI,authToken).then(async(results)=>{
            userDetails = await results.members.filter(element => element.user.principalName == reqData.userId)
            userDetails_Id = userDetails[0].id
            userDetails_displayName = userDetails[0].user.displayName
            userDetails_avatar = userDetails[0].user._links.avatar.href
            userDetails_url = userDetails[0].user.url
            userDetails_descriptor = userDetails[0].user.descriptor
            console.log("userDetails_Id-->"+ userDetails_Id + "userDetails_avatar-->"+userDetails_avatar+"userDetails_url-->"+userDetails_url+"userDetails_descriptor-->" + userDetails_descriptor)
    
            //create release defination
            releaseDefinationURI = `https://vsrm.dev.azure.com/${reqData.organization}/${reqData.project}/_apis/release/definitions?api-version=5.1`
            releaseDefinationBody = await getReleaseBody(userDetails_displayName,userDetails_url,userDetails_Id,reqData.userId,userDetails_avatar,userDetails_descriptor,buildresponse.name,buildresponse.project.id,buildresponse.project.name,buildresponse.id,buildresponse.queue.id,connectionServiceName,reqData.webAppName)
            await runPipelineCommon(releaseDefinationURI,authToken,releaseDefinationBody).then(async(results)=>{
                buildDefinationId = buildresponse.id //Buid Defination Id 
                console.log("-Buid Defination Id-->",buildDefinationId)
                //Create Build
                buildURI = `https://dev.azure.com/${reqData.organization}/${reqData.project}/_apis/build/builds?api-version=5.1`
                buildPipelineBody = { 
                    "definition": {
                        "id": buildDefinationId
                    }
                }
                await runPipelineCommon(buildURI,authToken,buildPipelineBody).then(async(response)=>{
                    query = `UPDATE [dbo].[devOpsStarter] SET status = 'Release Pipeline Definition Added Successfully.' WHERE processId = '${reqData.processId}'`
                    databaseResponse = await database(query)
                    resolve(response)
                }).catch(err=>{
                    console.log(err)
                    query = `UPDATE [dbo].[devOpsStarter] SET status = 'Build Pipeline (CI) Failed.' WHERE processId = '${reqData.processId}'`
                    reject(query)
                })
                
            }).catch((err)=>{
                console.log(err)
                query = `UPDATE [dbo].[devOpsStarter] SET status = 'Release Defination Failed.' WHERE processId = '${reqData.processId}'`
                reject(query)
            })

        }).catch(err=>{
            console.log(err)
            query = `UPDATE [dbo].[devOpsStarter] SET status = 'Release Defination Failed.' WHERE processId = '${reqData.processId}'`
            reject(query)
        })  
    }catch(err){
        console.log(err)
        query = `UPDATE [dbo].[devOpsStarter] SET status = 'Release Defination Failed.' WHERE processId = '${reqData.processId}'`
        reject(query)
    }
})
}

module.exports = {releasePipeline}