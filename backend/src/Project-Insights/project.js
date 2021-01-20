require('dotenv').config();
var request = require('request');
var sql = require("mssql");
const {checkUser} = require('./checkUserForGlobalAdmin')

//Checking the Project into database if it already exists or not.
async function checkProjectIntoDatabase(a3sId,reqData){
    try {
        return new Promise((resolve,reject)=>{
            var request = new sql.Request();
            var query = `SELECT * FROM [insights].[appinsightsinfo] WHERE project='${reqData.project_tag}' AND insightsurl='${reqData.url}' 
                            AND appId='${reqData.app_key}' AND accessKey='${reqData.secret_key}' AND a3sId='${a3sId}'`
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

//Add Projects in Application Insights Table of database.
async function addProjectIntoDatabaseAppInsights(a3sId,reqData){
    try {
        return new Promise((resolve,reject)=>{
            var request = new sql.Request();
            var query = `INSERT INTO [insights].[appinsightsinfo] VALUES ('${reqData.project_tag}',
                            '${reqData.url}','${reqData.app_key}','${reqData.secret_key}','${a3sId}')`
            request.query(query, async function (err, recordset) {
                if(err) {
                    resolve({"status":err})
                }else{   
                    resolve(recordset.recordset)  }
            })
        })
    }catch(error) { //Error occurred in try-catch block
        console.log(error)
        res.status(404).send({"status": "Error occurred..!!! Please try again."})
    }  
}

//Get list of resources with a particular Project-Tag under a particular subscription
async function requestProjectData(subscriptionId,tag,token){
    try{
        return new Promise((resolve)=>{
            var options = {
                'method': 'GET',
                'url': `https://management.azure.com/subscriptions/${subscriptionId}/resources?$filter=tagName eq 'Project' and tagValue eq '${tag}'&api-version=2019-10-01`,
                'headers': {
                    'Authorization': `${token}`  }
            }
            request(options, async function (error, response) { 
                if (!error && response.statusCode == 200){
                    resolve((JSON.parse(response.body)).value)
                }else if(error){
                    resolve([])  
                }else{
                    resolve({"status": JSON.parse(response.body)})  }
            });
        })
    }catch(error) { //Error occurred in try-catch block
        console.log(error)
        res.status(404).send({"status": "Error occurred..!!! Please try again."})
    }	
}

// ----------  ADD PROJECT  ------------
async function addProject(req,res) {
    try {
        await checkUser(req).then(async validate=>{
            var reqData = req.body
            var token = req.headers.authorization
            var a3sId = req.headers.id
            await checkProjectIntoDatabase(a3sId,reqData).then(async output=>{
                if(output.length>0){       //The project already been added in database before.
                    res.status(401).send({"status":"These credentials are already in use. Please retry with some other credentials."})
                }else{
                    await requestProjectData(reqData.subscriptionId,reqData.project_tag,token).then(async result=>{
                        if(result.status){
                            res.status(400).send(result)
                        }else{
                            res.send(result)  }
                    })                          
                }            
            }).catch(error=>{ //Error occurred in checkProjectIntoDatabase
                console.log("Error occurred: ",error)
                res.status(400).send({"status": "Error occurred..!!!"})
            })
        }).catch(error=>{ //Error occurred in checkUser
            res.status(401).send(error)
        })
    }catch(error) { //Error occurred in try-catch block
        console.log(error)
        res.status(404).send({"status": "Error occurred..!!! Please try again."})
    } 
}

//ADD PROJECT SELECTED BY USER
async function addProjectIntoDatabase(req,res){
    try {
        await checkUser(req).then(async validate=>{
            await getProjectSelectedByUser(req,res,'project').then(result=>{

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
                    })).catch(error=>{ //Error occuured while inserting data into database
                        reject(error)
                    })
                    
                }).then(result=>{
                    res.send({"status":"Data Successfully Inserted in Database..!!!"})
                }).catch(error=>{ //Error occuured while inserting data into database
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


//Get user's selected resources-tag data into a single formatted array that needs to be inserted into database.
async function getProjectSelectedByUser(req,res,key) {
    try {
        var reqData = req.body
        var token = req.headers.authorization
        var a3sId = req.headers.id
        var values= reqData.value
        var flag=true;
        return new Promise(async (resolve,reject)=>{
            if(values.length>0){
                if(key==='project'){
                    var outp = await addProjectIntoDatabaseAppInsights(a3sId,reqData)
                    if(outp && outp.status){
                        flag= false
                        reject(outp) 
                    }else{  flag= true }
                }else {    //key===resource
                    flag = true }

                if(flag){
                    Promise.all(values.map(async (element) => {
                        var result = await getProjectTagData(element.id,token)
                        result.subscriptionName= reqData.subscriptionName
                        result.res_id= element.id
                        result.a3sId= a3sId
                        return result
                    })).then(data => {
                        resolve(data);              
                    }).catch(error=>{ //Error occurred in getProjectTagData
                        reject(error) })                        
                }                
            }else{
                reject({"status":"You don't have selected anything...Please select and retry..!!!"})
            }            
        })         
    }catch(error) { //Error occurred in try-catch block
        console.log(error)
        res.status(404).send({"status": "Error occurred..!!! Please try again."})
    } 
}

//Get Tags data of user's selected resources
async function getProjectTagData(scope,token){
    try{
        return new Promise((resolve,reject)=>{
            var options = {
                'method': 'GET',
                'url': `https://management.azure.com/${scope}/providers/Microsoft.Resources/tags/default?api-version=2020-06-01`,
                'headers': {
                    'Authorization': `${token}`  }
            }
            request(options, async function (error, response) { 
                if (!error && response.statusCode == 200){
                    resolve((JSON.parse(response.body)).properties.tags)
                }else{
                    reject({"status":JSON.parse(response.body)})
                }
            });
        }) 
    }catch(error) { //Error occurred in try-catch block
        console.log(error)
        res.status(404).send({"status": "Error occurred..!!! Please try again."})
    } 	
}



//Deleting Project of particular subscription and a3sId from Database.
async function deleteProject(req,res) {
    try {
        await checkUser(req).then(validate=>{
            var reqData = req.body
            var a3sId = req.headers.id
            new Promise((resolve,reject)=>{
                var request = new sql.Request();
                var query = `DELETE FROM [insights].[taginfo] WHERE project='${reqData.project_tag}' AND subscriptionName='${reqData.subscriptionName}' AND a3sId='${a3sId}'`
                request.query(query, async function (err, recordset) {
                    if(err) {
                        reject(err)
                    }else{
                        
                        new Promise((resolve,reject)=>{
                            var request = new sql.Request();
                            var query = `DELETE FROM [insights].[appinsightsinfo] WHERE project='${reqData.project_tag}' AND a3sId='${a3sId}'`
                            request.query(query, async function (err, recordset) {
                                if(err) {
                                    reject(err)
                                }else{   
                                    resolve(recordset.recordset) }
                            })
                        }).then(res=>{
                            resolve("success")
                        }).catch(error=>{ //Error occurred while deleting project from database
                            reject(error)
                        }) 
                    }
                })
            }).then(result=> {
                res.send({"status": "Project successfully Deleted from Database..!!!"})
            }).catch(error =>{ //Error occurred while deleting project from database
                console.log('Error occurred: ',error)
                res.status(400).send({"status": "Error occurred..!!!"})
            })
        }).catch(error=>{ //Error occurred in checkUser
            res.status(401).send(error)
        })
    } catch(error) { //Error occurred in try-catch block
        console.log(error)
        res.status(404).send({"status": "Error occurred..!!! Please try again."})
    }    
}

//Get list of projects of a particular subscription according to the A3s Id.
async function getProject(req,res) {
    try {
        await checkUser(req).then(validate=>{
            var a3sId = req.headers.id

            new Promise((resolve,reject)=>{
                var request = new sql.Request();
                var query = `SELECT DISTINCT project,subscriptionName FROM [insights].[taginfo] WHERE a3sId='${a3sId}'`
                request.query(query, async function (err, recordset) {
                    if(err) {
                        reject(err)
                    } else{   
                        resolve(recordset.recordset) }
                })
            }).then(result=> {
                if(result.length===0){
                    res.send(result)
                }else{
                    var resultantData={}
                    var subscriptionList=[]
                    result.forEach(el => {
                        subscriptionList.push(el.subscriptionName) });
                    const distinctSubscriptionList = [... new Set(subscriptionList)]
                    distinctSubscriptionList.forEach(element => {
                        resultantData[element]=[]
                    });
                    result.forEach(element => {
                        resultantData[element.subscriptionName].push(element.project)
                    });
                    res.send(resultantData)
                }
            }).catch(error =>{//Error occurred while deleting project from database
                console.log('Error occurred: ',error)
                res.status(400).send({"status": "Error occurred..!!!"})
            })
            
        }).catch(error=>{ //Error occurred in checkUser
            res.status(401).send(error)
        })
    } catch(error) { //Error occurred in try-catch block
        console.log(error)
        res.status(404).send({"status": "Error occurred..!!! Please try again."})
    }    
}

module.exports = {addProject, deleteProject, getProject, addProjectIntoDatabase, requestProjectData, getProjectSelectedByUser}