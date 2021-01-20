require('dotenv').config();
const { database } = require('./database')

//getStatus
exports.getProjectStatusFromDatabase = async(req,res)=> {
    try{
        var processId = req.query.processId
        var query = `SELECT status FROM [dbo].[devOpsStarter] WHERE processId = '${processId}'`

        await database(query).then(status=>{
            if(status.length!==0){
                res.send(status[0])
            }else{
                res.status(400).send({"Status":"Invalid ProcessId. Please retry with another ProcessId"})
            }
        }).catch(error=>{ //Error while querying from database
            console.log("Error: ",error)
            res.status(400).send({"Database Error":error})
        })

    }catch(error){ //Error occurred in try-catch block
        console.log("Error in try-catch: ",error)
        res.status(400).send({"Error in try-catch":error})
    }   
}

//devopsProject
exports.getProjectsListFromDatabase = async(req,res)=> {
    try{
        var a3sId = req.headers.id
        var query = `SELECT * FROM [dbo].[devOpsStarter] WHERE a3sId='${a3sId}'`

        await database(query).then(projects=>{
            var projectLst=[] //Array storing the project names
            projects.forEach(element => {
                projectLst.push(element.project) }) //element.name ---> project-name
            res.send({"values":projects})           

        }).catch(error=>{ //Error while querying from database
            console.log("Error: ",error)
            res.status(400).send({"Database Error":error})
        })

        
    }catch(error){ //Error occurred in try-catch block
        console.log("Error in try-catch: ",error)
        res.status(400).send({"Error in try-catch":error})
    }   
}