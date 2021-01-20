const express = require('express')
const bodyParser = require('body-parser')
var randomstring = require("randomstring");
var cors = require('cors')
const app = express()
var mssql = require("mssql");
app.use(cors());
app.use(bodyParser.json())
const credentials = require('../../utils/Credentials')
const sitetosite = require('./NetworkingComponents')
const {paloAltoCurr} = require('./PaloAltoFirewall')
//Handle all the components in networking dashboards
exports.networkingHandler = async(req,res)=>{
    data = req.body
    if(data.Name === "Site-to-Site"){
        //check wether the both vnet name is available or not(./utils/vnetStatus) if it gives 400

        await sitetosite.sitetositeorchestration(req).then((Output)=>{
            console.log("Sucesss-->")
            res.send(Output)
        }).catch((err)=>{
            console.log("reject--->")
            res.status(400).send(err)
        })
    }else if(data.Name === "Point-to-Site"){
        console.log('Point-to-Site')
        await sitetosite.pointtositeOrchestration(req).then((Output)=>{
            console.log("Sucesss-->")
            res.send(Output)
        }).catch((err)=>{
            console.log("reject--->")
            res.status(400).send(err)
        })

    }else if(data.Name === "Azure-Firewall"){
        console.log('Azure-Firewall')
        await sitetosite.AzureFirewallOrchestration(req).then((Output)=>{
            console.log("Sucesss-->")
            res.send(Output)
        }).catch((err)=>{
            console.log("reject--->")
            res.status(400).send(err)
        })
        
    }else if(data.Name === 'Express-Route'){
        console.log('Express-Route')
        await sitetosite.ExpressRouteOrchestration(req).then((Output)=>{
            console.log("Sucesss-->")
            res.send(Output)
        }).catch((err)=>{
            console.log("reject--->")
            res.status(400).send(err)
        })
        
    }else if(data.Name === "VirtualNetwork-Subnet"){ //VirtualNetwork-Subnet request
        //check wether the  vnet name is available or not(./utils/vnetStatus) if it gives 400
        //Then Virtual network can be deployed
        await sitetosite.virtualNetworkOrchestration(req).then((Output)=>{
            res.send(Output)
        }).catch((err)=>{
            res.status(400).send(err)
        })
        
    }else if(data.Name === "VirtualNetwork-Peering"){   //VirtualNetwork-Peering request
        //check wether the both vnet name is available or not(./utils/vnetStatus) if it gives 400
        //Then Virtual network  peering can be deployed
        await sitetosite.virtualNetworkPeeringOrchestration(req).then((Output)=>{
            res.send(Output)
        }).catch((err)=>{
            res.status(400).send(err)
        })
        
    }else if(data.Name === "Palo-Alto"){
        await credentials.getcredentials(req.headers.id).then(async cred=>{
            await paloAltoCurr(data,cred,'Palo-Alto'+randomstring.generate(5)).then(Output=>{
                res.send(Output)
            }).catch(err=>{
                res.status(400).send({"Error":"Not Available"})
            })
        }).catch(err=>{
            res.status(400).send(err)
        })
         
    }

}