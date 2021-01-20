const express = require('express')
const bodyParser = require('body-parser')
var randomstring = require("randomstring");
var cors = require('cors')
const app = express()
app.use(cors());
app.use(bodyParser.json())
const credentials = require('../../utils/Credentials')
const {funcAppCurr} = require('./Scripts/FunctionApp')
const component = require('./Scripts/Component')
const {webAppCurr} = require('./Scripts/WebApp')

exports.integrationHandler = async(req,res)=>{
    try{
    data = req.body
    console.log('------------------------------')
    const cred = await credentials.getcredentials(req.header('id'))
    if(data.Name === "Logic App"){
        console.log('logic app request')
        await component.logicAppOrchestration(req).then((results)=>{
            res.send(results)
        }).catch(err=>{
            res.status(400).send(err)
        }) 
    }else if(data.Name === "API Management (APIM)"){
        console.log('API Management request')
        await component.apimOrchestration(req).then((results)=>{
            res.send(results)
        }).catch(err=>{
            res.status(400).send(err)
        })    
    }else if(data.Name === "Function App"){
        console.log(' Function App request')
        const Output = await funcAppCurr(data,cred,'FuntionApp'+randomstring.generate(5))
        res.send(Output)
    }else if(data.Name === "Web App"){
        console.log('Web App')
        const Output = await webAppCurr(data,cred,'WebApp'+randomstring.generate(5))
        res.send(Output)
    }
}catch(err){
    console.log(err)
}
}
