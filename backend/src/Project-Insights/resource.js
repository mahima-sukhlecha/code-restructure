require('dotenv').config();
var sql = require("mssql");
const {requestProjectData} = require('./project')
const {getProjectSelectedByUser} = require('./project')
const {checkUser} = require('./checkUserForGlobalAdmin')

//Get list of resources of a particular project in a particular subscription with a particular a3sId
async function getResourcesFromDatabase(a3sId,tag,subsName){
    try {
        return new Promise((resolve,reject)=>{
            var request = new sql.Request();
            var query = `SELECT resourceId FROM [insights].[tagInfo] WHERE a3sId='${a3sId}' AND project='${tag}' AND subscriptionName='${subsName}'`
            request.query(query, async function (err, recordset) {
                if(err) {
                    reject(err)
                }else{   
                    resolve(recordset.recordset)  }
            })
        })
    }catch(error) { //Error occurred in try-catch block
        console.log(error)
        res.status(404).send({"status": "Error occurred..!!! Please try again."})
    }
}

// ----------  ADD RESOURCE  ------------
async function addResource(req,res) {
    try {
        await checkUser(req).then(async validate=>{
            var reqData = req.body
            var data= []              
            var token = req.headers.authorization
            var a3sId = req.headers.id
            await requestProjectData(reqData.subscriptionId,reqData.project_tag,token).then(async result=>{
                if(result.status){
                    res.status(400).send(result)
                }else{
                    data=result                        
                    var json={"repeated":[],"non-repeated":[]}
                    await getResourcesFromDatabase(a3sId,reqData.project_tag,reqData.subscriptionName).then(result=>{
                        if(result.length===0){
                            res.status(400).send({"status":"No data found in database. Resource can't be added!!"})
                        }else{ 
                            data.forEach(dataElement => {
                                var repeated =false
                                result.forEach(element=> {
                                    if(!repeated && dataElement.id===element.resourceId){
                                        repeated= true  }                                
                                })
                                if(repeated){
                                    json["repeated"].push(dataElement) 
                                }else{
                                    json["non-repeated"].push(dataElement)  }
                            });
                            res.send(json)
                        }                            
                    }).catch(error=>{ //Error occurred in getResourcesFromDatabase
                        console.log("Error occurred: ",error)
                        res.status(400).send({"status": "Error occurred..!!!"})
                    })
                }      
            })   
        }).catch(error=>{ //Error occurred in checkUser
            res.status(401).send(error)
        })                              
    }catch(error) { //Error occurred in try-catch block
        console.log(error)
        res.status(404).send({"status": "Error occurred..!!! Please try again."})
    } 
}

//ADD RESOURCES SELECTED BY USER
async function addResourceIntoDatabase(req,res){
    try {
        await checkUser(req).then(async validate=>{
            await getProjectSelectedByUser(req,res,'resource').then(result=>{

                new Promise((resolve,reject)=>{
                    Promise.all(result.map(async (ele) => {
                        var request = new sql.Request();
                        var query = `INSERT INTO [insights].[tagInfo] VALUES ('${ele.Project}','${ele.Environment}','${ele.Interface}','${ele.Processes}','${ele.subscriptionName}','${ele.res_id}','${ele.a3sId}')`
                        request.query(query, async function (err, recordset) {
                            if(err) {
                                reject(err)
                            }else{   
                                resolve(recordset.recordset)  }
                        })
                    })).then((result => {
                        resolve("success");              
                    })).catch(error=>{ //Error occurred while inserting data into database
                        reject(error)
                    })
                }).then(result=>{
                    res.send({"status":"Data Successfully Inserted in Database..!!!"})
                }).catch(error=>{ //Error occurred while inserting data into database
                    console.log('Error occurred: ',error)
                    res.status(404).send({"status":"Error occurred while inserting data into Database..!!!"})
                })

            }).catch(error=>{ //Error occurred in getProjectSelectedByUser
                console.log("Error occurred: ",error)
                res.status(400).send(error)
            })
        }).catch(error=>{ //Error occurred in checkUser
            res.status(401).send(error)
        }) 
    }catch(error) { //Error occurred in try-catch block
        console.log(error)
        res.status(404).send({"status": "Error occurred..!!! Please try again."}) 
    }   
}


//Delete resources from table w.r.t. their resourceId & a3sID
async function deleteResource(req,res){
    try {
        await checkUser(req).then(validate=>{
            var a3sId = req.headers.id
            var values = req.body.value
            var project = req.body.project
            var subscriptionName = req.body.subscriptionName

            new Promise((resolve,reject)=>{
                Promise.all(values.map(async (element) => {
                    var request = new sql.Request();
                    var query = `DELETE FROM [insights].[tagInfo] WHERE a3sId='${a3sId}' AND resourceId='${element.id}'`
                    request.query(query, async function (err, recordset) {
                        if(err) { //Error occurred while deleting data from database
                            reject(err)
                        }else{   
                            resolve(recordset.recordset)  }
                    })
                })).then(async result => {
                    await getResourcesFromDatabase(a3sId,project,subscriptionName).then(re=>{
                        if(re.length===0){
                            new Promise(()=>{
                                var request = new sql.Request();
                                var query = `DELETE FROM [insights].[appinsightsinfo] WHERE project='${project}' AND a3sId='${a3sId}'`
                                request.query(query, async function (err,recordset3) {   
                                    res.send({"status":"Data successfully deleted from database..!!!"})                                 
                                })     })
                        }else{
                            res.send({"status":"Data successfully deleted from database..!!!"})   }
                    })
                }).catch(error=>{ //Error occurred while deleting data from database
                    console.log("Error occurred: ",error)
                    res.status(400).send({"Error":error})
                })
            })

        }).catch(error=>{ //Error occurred in checkUser
            res.status(401).send(error)
        })       
    }catch(error) { //Error occurred in try-catch block
        console.log(error)
        res.status(404).send({"status": "Error occurred..!!! Please try again."})
    }
}

module.exports = {addResource, addResourceIntoDatabase, deleteResource}