var request = require('request');
const { createProject } = require("./Create-Project");
const { createWebApp } = require('./Create-WebApp');
const { database } = require('./database');
const { serviceConnection } = require('./Service-Connection');
const { pushCodeToRepository } = require('./Import-Code');
const { buildPipeline } = require('./Build-Pipeline');
const {releasePipeline} = require('./Release-Pipeline')

var servicePrincipleId;

exports.orchestration = async(req,res)=> {
    try{
        var reqData = req.body
        var token = req.headers.authorization
        var patToken = reqData.patToken
        var a3sId = req.headers.id
        var query = `INSERT INTO [dbo].[devOpsStarter] VALUES('${reqData.userId}','${reqData.processId}','${a3sId}','${reqData.webAppName}','${reqData.project}','${reqData.organization}','Accepted.','${reqData.displayName}')`
        databaseResponse = await database(query)  //Data inserted into DB for tracking
        console.log("Request Accepted.")

        createProject(reqData,patToken).then(async result1=>{  //Project 
            console.log("Project Creating...")      

            await createWebApp(reqData,token).then(async result2=>{    //ASP & WebApp 
                console.log("App Service Plan & Web App Created")

                await serviceConnection(reqData,patToken,a3sId).then(async result3=>{   //Service Connection
                    servicePrincipleId = result3.servicePrincipleID
                    console.log('Service principle Id', servicePrincipleId)

                    await pushCodeToRepository(reqData,patToken).then(async result4=>{    //Code into Repository
                        console.log("Code Imported Successfully.")

                        await buildPipeline(reqData,patToken).then(async result5=>{ //Build pipeline defination
                            console.log('Build Pipeline Defination')
                            
                            await releasePipeline(reqData,patToken,result5,servicePrincipleId).then(result6=>{ //Release Pipeline defination and start build(CI)
                                console.log('Release Pipeline Defination and start build')
                                console.log(result6)
                            }).catch(async query=> {
                            databaseResponse = await database(query)
                            console.log("Error77777777777: ",query) //Error while running release pipeline
                        })
                            
                        }).catch(async error=> {
                            query = `UPDATE [dbo].[devOpsStarter] SET status = 'Build Pipeline Failed.' WHERE processId = '${reqData.processId}'`
                            databaseResponse = await database(query)
                            console.log("Error66666666: ",error) //Error while running build pipeline
                            
                        })

                    }).catch(async error=> {
                        query = `UPDATE [dbo].[devOpsStarter] SET status = 'Import Code To Repository Failed.' WHERE processId = '${reqData.processId}'`
                        databaseResponse = await database(query)
                        console.log("Error555555555: ",error)//Error while importing code into Repository
                    })
    
                }).catch(async error=> {
                    query = `UPDATE [dbo].[devOpsStarter] SET status = 'Service Connection Creation Failed.' WHERE processId = '${reqData.processId}'`
                    databaseResponse = await database(query)
                    console.log("Error44444444: ",error)//Error while creating service connection
                })

            }).catch(async error=>{
                query = `UPDATE [dbo].[devOpsStarter] SET status = 'WebApp & AppServicePlan Creation Failed.' WHERE processId = '${reqData.processId}'`
                databaseResponse = await database(query)
                console.log("Error11111111: ",error)//Error while creating web app & app service plan
            })

        }).catch(async error=>{
            query = `UPDATE [dbo].[devOpsStarter] SET status = 'Project Creation Failed.' WHERE processId = '${reqData.processId}'`
            databaseResponse = await database(query)
            console.log("Error2222222222222: ",error)//Error while creating project
        })
         
        res.send({"status":"success"}) // Send Response to frontend
    }catch(error){
        console.log("Error33333: ",error) //Error in try Catch
    }
}