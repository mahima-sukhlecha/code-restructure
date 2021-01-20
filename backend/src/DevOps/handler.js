const express = require('express')
const bodyParser = require('body-parser')
var cors = require('cors')
const app = express()
app.use(cors());
app.use(bodyParser.json())
var randomstring = require("randomstring");
const credentials = require('../../utils/Credentials')
const {azureKubernetesServiceCurr} = require("./Scripts/AKS")
const component = require("./Scripts/Components")
const {serviceFabricCurr} = require("./Scripts/Service_Fabric")

exports.devOpsHandler = async(req,res)=>{
    reqData = req.body
    console.log('------------------------------')
    if(reqData.Configurations === 'Azure Kubernetes Service'){
        console.log('Azure Kubernetes Service')
        await credentials.getcredentials(req.header('id')).then(async(cred)=>{
            await azureKubernetesServiceCurr(reqData.data,cred,'AKS'+randomstring.generate(5)).then(Output=>{
                res.send(Output)
            }).catch(error=>{
                res.status(400).send({"Error":"Error in Deploying Resource"})
            })
        }).catch(error=>{
            console.log(error)
            res.status(400).send({"Error":"Invalid Token"})
        })
    }else if(reqData.Configurations === 'Container Registry'){
        
        console.log('Container Registry request')
        await component.containerRegistryOrchestration(req).then((response)=>{
            res.send(response)
        }).catch(err=>{
            res.status(400).send(err)
        })
        

    }else if(reqData.Configurations === 'Service Fabrics'){
        console.log('Service Fabric request')
        await credentials.getcredentials(req.header('id')).then(async cred=>{
            await serviceFabricCurr(reqData.data,cred,'Service Fabric'+randomstring.generate(5)).then(Output=>{
                res.send(Output)
            }).catch(error=>{
            res.status(400).send({"Error":"Error in Deploying Resource"})
            })
        }).catch(error=>{
        console.log(error)
        res.status(400).send({"Error":"Invalid Token"})
        })

    }else if(reqData.Configurations === 'Azure Container Instance'){
        console.log('Container Instance request')
        await component.containerInstanceOrchestration(req).then((response)=>{
            res.send(response)
        }).catch(err=>{
            res.status(400).send(err)
        })
}
}

