const express = require('express')
const bodyParser = require('body-parser')
var randomstring = require("randomstring");
var cors = require('cors')
const app = express()
app.use(cors());
app.use(bodyParser.json())
const credentials = require('../../utils/Credentials')
const {storage_databaseCurr} =  require("./Scripts/Storage_DB")
const {datafactoryCurr} = require("./Scripts/Datafactory")
const {sapCurr} = require("./Scripts/dataFacSAP")
const {dataWarehouseCurr} =  require("./Scripts/Storage_DW")
const {sqlserverCurr} = require("./Scripts/SqlServer")
const {storage_elasticpoolCurr} =  require("./Scripts/ElasticPool")
const {oracleCurr} = require("./Scripts/oracle")
const {dynamic365Curr} = require("./Scripts/Dynamic365")
const {datalakeCurr} = require("./Scripts/DataLake")
const {datalakeSAPCurr} = require("./Scripts/datalakeSAP")
const {datalakeOracleCurr} = require("./Scripts/datalakeOracle")
const {dynamic365_DLCurr} = require("./Scripts/datalaked365")
const {sqlserver_DLCurr} = require("./Scripts/datalakeserver")
const {sap_SynapseCurr} = require("./Scripts/synapse_SAP")
const {oracle_SynapseCurr} = require("./Scripts/synapse_Oracle")
const {dynamic365_SynapseCurr} = require("./Scripts/synapse_d365")
const {sqlserverSynapseCurr} = require("./Scripts/synapse_server");

//const { Output } = require('terraform-generator');

exports.dataETLHandler = async(req,res)=>{
    data = req.body
    const cred = await credentials.getcredentials(req.headers.id)
    if(data.Name === "Storage_DB"){
        console.log('storage account & DAtabase request')
       await storage_databaseCurr(data,cred,'Storage_DB'+randomstring.generate(5)).then(Output=>{
        res.send(Output)
    }).catch(err=>{
        res.status(400).send({"Error":"Not Available"})
    })
    }else if(data.Name === "Datafactory"){
        console.log('DataFactory request')
        await datafactoryCurr(data,cred,'Datafactory'+randomstring.generate(5)).then(Output=>{
            res.send(Output)
        }).catch(err=>{
            res.status(400).send({"Error":"Not Available"})
        })
    }else if(data.Name === "SAP"){
        console.log('SAP request')
        await sapCurr(data,cred,'SAP'+randomstring.generate(5)).then(Output=>{
            res.send(Output)
        }).catch(err=>{
            res.status(400).send({"Error":"Not Available"})
        }) 
    }else if(data.Name === "Storage_DW"){
        console.log('storage account & Datawarehouse request')
        await dataWarehouseCurr(data,cred,'Storage_DW'+randomstring.generate(5)).then(Output=>{
            res.send(Output)
        }).catch(err=>{
            res.status(400).send({"Error":"Not Available"})
        })
    }else if(data.Name === "SQL"){
        console.log('SQL request')
        await sqlserverCurr(data,cred,'SQL_Server'+randomstring.generate(5)).then(Output=>{
            res.send(Output)
        }).catch(err=>{
            res.status(400).send({"Error":"Not Available"})
        })
    }else if(data.Name === "Storage_EP"){
        console.log('storage account & Elastic pool request')
        await storage_elasticpoolCurr(data,cred,'Storage_EP'+randomstring.generate(5)).then(Output=>{
            res.send(Output)
        }).catch(err=>{
            res.status(400).send({"Error":"Not Available"})
        })
    }else if (data.Name === "Oracle"){
        console.log('Oracle request')
        await oracleCurr(data,cred,'Oracle'+randomstring.generate(5)).then(Output=>{
            res.send(Output)
        }).catch(err=>{
            res.status(400).send({"Error":"Not Available"})
        })
    }else if(data.Name === "Dynamic365"){
        console.log('Dynamic365request')
        await dynamic365Curr(data,cred,'Dynamic365'+randomstring.generate(5)).then(Output=>{
            res.send(Output)
        }).catch(err=>{
            res.status(400).send({"Error":"Not Available"})
        })
    }else if(data.Name === "DataLake"){
        console.log('DataLake request')
        await datalakeCurr(data,cred,'DataLake'+randomstring.generate(5)).then(Output=>{
            res.send(Output)
        }).catch(err=>{
            res.status(400).send({"Error":"Not Available"})
        })
    }else if(data.Name === "DataLake_Oracle"){
        console.log('DataLake_Oracle request')
        await datalakeOracleCurr(data,cred,'DataLake_Oracle'+randomstring.generate(5)).then(Output=>{
            res.send(Output)
        }).catch(err=>{
            res.status(400).send({"Error":"Not Available"})
        })   
    }else if(data.Name === "DataLake_SAP"){
        console.log('DataLake_SAP request')
        await datalakeSAPCurr(data,cred,'DataLake_SAP'+randomstring.generate(5)).then(Output=>{
            res.send(Output)
        }).catch(err=>{
            res.status(400).send({"Error":"Not Available"})
        })
    }else if(data.Name === "DataLake_Dynamic365"){
        console.log('DataLake_Dynamic365 request')
        await dynamic365_DLCurr(data,cred,'DataLake_Dynamic365'+randomstring.generate(5)).then(Output=>{
            res.send(Output)
        }).catch(err=>{
            res.status(400).send({"Error":"Not Available"})
        })
    }else if(data.Name === "DataLake_SQL"){
        console.log('DataLake_SQL request')
        await sqlserver_DLCurr(data,cred,'DataLake_SQL'+randomstring.generate(5)).then(Output=>{
            res.send(Output)
        }).catch(err=>{
            res.status(400).send({"Error":"Not Available"})
        })
    }else if(data.Name === "Oracle_Synapse"){
        console.log('Oracle_Synapse request')
        await oracle_SynapseCurr(data,cred,'Oracle_Synapse'+randomstring.generate(5)).then(Output=>{
            res.send(Output)
        }).catch(err=>{
            res.status(400).send({"Error":"Not Available"})
        })
    }else if(data.Name === "Dynamic365_Synapse"){
        console.log('Dynamic365_Synapse request')
        await dynamic365_SynapseCurr(data,cred,'Dynamic365_Synapse'+randomstring.generate(5)).then(Output=>{
            res.send(Output)
        }).catch(err=>{
            res.status(400).send({"Error":"Not Available"})
        })
    }else if(data.Name === "SAP_Synapse"){
        console.log('SAP_Synapse request')
        await sap_SynapseCurr(data,cred,'SAP_Synapse'+randomstring.generate(5)).then(Output=>{
            res.send(Output)
        }).catch(err=>{
            res.status(400).send({"Error":"Not Available"})
        })
    }else if(data.Name === "SQL_Synapse"){
        console.log('SQL_SynapseL request')
        await sqlserverSynapseCurr(data,cred,'SQL_Synapse'+randomstring.generate(5)).then(Output=>{
            res.send(Output)
        }).catch(err=>{
            res.status(400).send({"Error":"Not Available"})
        })
        
    }

}