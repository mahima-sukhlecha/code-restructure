const express = require('express')
const bodyParser = require('body-parser')
var randomstring = require("randomstring");
var cors = require('cors')
const app = express()
app.use(cors());
app.use(bodyParser.json())
const credentials = require('../../utils/Credentials')
const blueprint =  require("./Scripts/Blueprint")
var parse = require('./parseExcel/parse')

exports.parseExcel = async(req,res,file_obj,subscriptionId)=>{
  const cred = await credentials.getcredentials(req.headers.id)   //clientId,clientSecret,tenantId
  var json_data = await parse.parseExcel(file_obj)  //parse excel into JSON

  if(json_data.status){   //invalid excel file, invalid file format, empty excel file
    res.statusCode = 400
    res.send(json_data)
  }else{
    json_data['subscriptionId'] = subscriptionId 
    const Output = await blueprint.blueprintCurr(json_data,cred,'InfrastructureBlueprint'+randomstring.generate(5))
    res.send(Output)
  }
      
}