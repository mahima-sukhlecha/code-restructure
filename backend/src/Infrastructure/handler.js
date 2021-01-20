const express = require('express')
const bodyParser = require('body-parser')
var cors = require('cors')
const app = express()
app.use(cors());
app.use(bodyParser.json())
var randomstring = require("randomstring");
const componentStorage = require('./Scripts/ComponentStorage')
const componentVM = require('./Scripts/ComponentVM')
var {wvdiCurr} = require('./Scripts/WVDI')
const credentials = require('../../utils/Credentials')

exports.networkingInfraHandler = async(req,res)=>{
    reqData = req.body
    console.log('---------------network---------------')
    
    if(reqData.Name === "Azure Data Lake Storage (ADLS) Generation 1"){
        console.log('Azure Data Lake Storage (ADLS) Generation 1 request')
        await componentStorage.adlsGen1Orchestration(req).then((results)=>{
            res.send(results)
        }).catch(err=>{
            res.status(400).send(err)
        })
    }else if(reqData.Name === "Azure Data Lake Storage (ADLS) Generation 2"){
        console.log('Azure Data Lake Storage (ADLS) Generation 2 request')
        await componentStorage.adlsGen2Orchestration(req).then((results)=>{
            res.send(results)
        }).catch(err=>{
            res.status(400).send(err)
        })
    }else if(reqData.Name === "Azure Storage Account"){
        console.log('"Azure Storage Account request')
        await componentStorage.adlsGen2Orchestration(req).then((results)=>{
            res.send(results)
        }).catch(err=>{
            res.status(400).send(err)
        })
    }else if(reqData.Name === "SQL storage"){
        console.log("sqldatabase")
        await componentStorage.databaseOrchestration(req).then((results)=>{
            res.send(results)
        }).catch(err=>{
            res.status(400).send(err)
        })

    }else if(reqData.Name === "Create server"){
        console.log("create server")
        await componentStorage.createServer(req).then((results)=>{
            res.send(results)
        }).catch(err=>{
            res.status(400).send(err)
        })
    }else if(reqData.Name === "Virtual Machine"){
        console.log('Virtual Machine request')
        await componentVM.virtualmachineOrchestration(req).then((results)=>{
            res.send(results)
        }).catch(err=>{
            res.status(400).send(err)
        })
    }else if(reqData.Name === "CosmosDB"){
        console.log('CosmosDB')
        await componentStorage.cosmosAccount(req).then((results)=>{
            res.send(results)
        }).catch(err=>{
            res.status(400).send(err)
        })
    }else if(reqData.Name === "CosmosDBTables"){
        console.log('CosmosDB')
        await componentStorage.cosmosOrchestration(req).then((results)=>{
            res.send(results)
        }).catch(err=>{
            res.status(400).send(err)
        })
    }
    else if(reqData.Name === "SQL Virtual Machine"){
        
        console.log('SQL Virtual Machine')
        await componentVM.sqlonvmOrchestration(req).then((results)=>{
            res.send(results)
        }).catch(err=>{
            res.status(400).send(err)
        })
    }else if(reqData.Name === "WVDI"){
        console.log('WVDI')
        const cred = await credentials.getcredentials(req.header('id'))
        var date=new Date();
        reqData.tokenExpirationTime=new Date(date.setDate(date.getDate()+20));
        await wvdiCurr(reqData,cred,'WVDI'+randomstring.generate(5)).then((results)=>{
            res.send(results)
        }).catch(err=>{
            res.status(400).send(err)
        })
    }
}
