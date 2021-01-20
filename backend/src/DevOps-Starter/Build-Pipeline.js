require('dotenv').config();
var request = require('request');
var {getBuildBody} = require('./Build-body')
var {database} = require('./database')
var {runPipelineCommon,getPipelineDetails} = require('./Pipeline-Common')

//Creating Build Pipeine Defination
buildPipeline= async(reqData,authToken) => {
        return new Promise(async(resolve,reject)=>{
            try{
            queuesURI = `https://dev.azure.com/${reqData.organization}/${reqData.project}/_apis/distributedtask/queues?api-version=5.1-preview.1`
            await getPipelineDetails(queuesURI,authToken).then(async(results)=>{
                azurePipelineQueue = await results.value.filter(element => element.name == "Azure Pipelines")
                azurePipelineId = azurePipelineQueue[0].id
                buildDefinationURI = `https://dev.azure.com/${reqData.organization}/${reqData.project}/_apis/build/definitions?api-version=6.0-preview.7`
                //create build defination
                definationBody = getBuildBody(reqData.project,reqData.organization,azurePipelineId)
                await runPipelineCommon(buildDefinationURI,authToken,definationBody).then(async(results)=>{
                    query = `UPDATE [dbo].[devOpsStarter] SET status = 'Build Defination Added Successfully.' WHERE processId = '${reqData.processId}'`
                    databaseResponse = await database(query)
                    resolve(results)
                }).catch(async(err)=>{
                    console.log(err)
                    reject(err)
                })
    
            }).catch(async err=>{
                console.log(err)
                reject(err)
            })
        }catch(err){
            console.log("---",err)
            reject(err)
        }
        })
  
    
}
//console.log(err)
// query = `UPDATE [dbo].[devOpsStarter] SET status = 'Build Pipeline Failed' WHERE processId = ${reqData.processId}`
// databaseResponse = await database(query)

module.exports = {buildPipeline}