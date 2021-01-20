require('dotenv').config();
var request = require('request');
var requestBody = require('./RequestBody.json')
var {getAvailability} = require('../../utils/vnetStatus')
//Deploy Virtual network in a particular RG
async function vNet(virNetName,reqData,vnetbody,authToken){
    return new Promise((resolve,reject)=>{
        var options = {
            'method': 'PUT',
            'url':`https://management.azure.com/subscriptions/${reqData.subscriptionId}/resourcegroups/${reqData.resource.resourceGroup}/providers/Microsoft.Network/virtualNetworks/${virNetName}?api-version=2020-04-01`,
            'headers': {
                'Authorization': authToken,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(vnetbody)

        };
        console.log("------------In Vnet ----") 
        request(options, function (error, response) {
          if (!error && (response.statusCode == 201 || response.statusCode == 200)){
              resolve({
                  "statusCode" : response.statusCode,
                  "body" : JSON.parse(response.body)
              })
          }else if(!error && response.statusCode >= 400){
            reject(JSON.parse(response.body))
        }else{
          console.log(error)
          reject(error)
      }
    })
})
}
//Deploy PublicIP in a particular RG
async function publicIP(reqData,publicIPBody,authToken){
  console.log("inpulicIP")
    return new Promise((resolve,reject)=>{
        var options = {
            'method': 'PUT',
            'url':`https://management.azure.com/subscriptions/${reqData.subscriptionId}/resourcegroups/${reqData.resource.resourceGroup}/providers/Microsoft.Network/publicIPAddresses/${reqData.virtualNetConfig.publicIP}?api-version=2020-04-01`,
            'headers': {
                'Authorization': authToken,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(publicIPBody)

        };
        console.log("----------------publici----------")

        request(options, function (error, response) {
          if (!error && response.statusCode == 201){
            resolve({
              "statusCode" : response.statusCode,
              "body" : JSON.parse(response.body)
          })
            }else if(!error && response.statusCode >= 400){
    
                reject(JSON.parse(response.body))
          }else{
            console.log(error)
            reject(error)
        }

    })
})
}
//Deploy Virtual Network Gateway in a particular RG
async function virtualNetGateway(gatewayBody,reqData,authToken){
    return new Promise((resolve,reject)=>{
		console.log("--------------------------------------->",reqData.resource.resourceGroup)
        var options = {
            'method': 'PUT',
            'url':`https://management.azure.com/subscriptions/${reqData.subscriptionId}/resourcegroups/${reqData.resource.resourceGroup}/providers/Microsoft.Network/virtualNetworkGateways/${reqData.virtualNetConfig.gatewayName}?api-version=2020-04-01`,
            'headers': {
                'Authorization': authToken,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(gatewayBody)

        };
        console.log("------------------------------virtualNetGateway ----")
        console.log("----->",options)
        request(options, function (error, response) {
            if (!error && response.statusCode == 201){
                resolve({
                    "statusCode" : response.statusCode,
                    "body" : JSON.parse(response.body)
                })
            }else if(!error && response.statusCode >= 400){
              if(response.statusCode == 429) {
                virtualNetGateway(gatewayBody,reqData,authToken).then(res=>{
                  resolve(res)
                }).catch(err=>{
                  reject(err)
                })
              }else{
                reject(JSON.parse(response.body))
              }
          }else{
            console.log(error)
            reject(error)
        }
  
    })
})
}
//Deploy LocalNetworkGateway in a particular RG
async function localNetGateway(reqData,localGatewayBody,authToken){
    return new Promise((resolve,reject)=>{
        var options = {
            'method': 'PUT',
            'url':`https://management.azure.com/subscriptions/${reqData.subscriptionId}/resourcegroups/${reqData.resource.resourceGroup}/providers/Microsoft.Network/localNetworkGateways/${reqData.localConfig.name}?api-version=2020-04-01`,
            'headers': {
                'Authorization': authToken,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(localGatewayBody)

        };
    console.log("---------------localnetGateway----------------------")
        request(options, function (error, response) {
            if (!error && response.statusCode == 201){
                resolve({
                    "statusCode" : response.statusCode,
                    "body" : JSON.parse(response.body)
                })
            }else if(!error && response.statusCode >= 400){
                reject(JSON.parse(response.body))
          }else{
            console.log(error)
            reject(error)
        }
    })
})
}
//Deploy Express Route 
async function expressRoute(reqData,expressbody,authToken){
    return new Promise((resolve,reject)=>{
        var options = {
            'method': 'PUT',
            'url':`https://management.azure.com/subscriptions/${reqData.subscriptionId}/resourcegroups/${reqData.resource.resourceGroup}/providers/Microsoft.Network/expressRouteCircuits/${reqData.expressConfig.cktName}?api-version=2020-04-01`,
            'headers': {
                'Authorization': authToken,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(expressbody)

        };
        console.log("------------------------------In Vnet ----")

        request(options, function (error, response) {
            if (!error && (response.statusCode == 201 || response.statusCode == 200)){
                resolve({
                    "statusCode" : response.statusCode,
                    "body" : JSON.parse(response.body)
                })
            }else if(!error && response.statusCode >= 400){
              if(response.statusCode == 429) {
                expressRoute(reqData,expressbody,authToken)
              }else{
                reject(JSON.parse(response.body))
              }
          }else{
            console.log(error)
            reject(error)
        }

    })
})
}
// Deploy Azure Firewall in a particular RG
async function azureFirewall(reqData,firewallBody,authToken){
    return new Promise((resolve,reject)=>{
        var options = {
            'method': 'PUT',
            'url':`https://management.azure.com/subscriptions/${reqData.subscriptionId}/resourcegroups/${reqData.resource.resourceGroup}/providers/Microsoft.Network/azureFirewalls/${reqData.firewallConfig.firewallName}?api-version=2020-05-01`,
            'headers': {
                'Authorization': authToken,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(firewallBody)

        };
        console.log("------------------------------In firewall ----")
        console.log(options)

        request(options, function (error, response) {
            if (!error && (response.statusCode == 201 || response.statusCode == 200)){
                resolve({
                    "statusCode" : response.statusCode,
                    "body" : JSON.parse(response.body)
                })
            }else if(!error && response.statusCode >= 400){
              if(response.statusCode == 429) {
                azureFirewall(reqData,firewallBody,authToken).then(res=>{
                  resolve(res)
                }).catch(err=>{
                  reject(err)
                })
              }else{
                reject(response.body)
              }
          }else{
            console.log(error)
            reject(error)
        }

    })
})
}

// Make Vnet Peering  after both the Vnets are deployed
async function vnetPeering(virNetName,reqData,peeringBody,peeringName,authToken){
    return new Promise((resolve,reject)=>{
        var options = {
            'method': 'PUT',
            'url':`https://management.azure.com/subscriptions/${reqData.subscriptionId}/resourcegroups/${reqData.resource.resourceGroup}/providers/Microsoft.Network/virtualNetworks/${virNetName}/virtualNetworkPeerings/${peeringName}?api-version=2020-04-01`,
            'headers': {
                'Authorization': authToken,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(peeringBody)

        };
    console.log("---------------vnetPeering---------------------")
        request(options, function (error, response) {
            if (!error && response.statusCode == 201){
                resolve({
                    "statusCode" : response.statusCode,
                    "body" : JSON.parse(response.body)
                })
            }
            else if (!error && response.statusCode == 200){
                resolve({
                    "statusCode" : response.statusCode,
                    "body" : JSON.parse(response.body)
                })
            }else if(!error && response.statusCode >= 400){
              if(response.statusCode == 429 || response.statusCode == 400) {
                vnetPeering(virNetName,reqData,peeringBody,peeringName,authToken).then(res=>{
                resolve(res)
                }).catch(err=>{
                  reject(err)
                })
              }else{
                reject(response.body)
              }
          }else{
            console.log(error)
            reject(error)
        }
    })

    })
}
//------- Site to Site Deployement started---------
//Make connection in S2S
async function connection(reqData,authToken){
  return new Promise((resolve,reject)=>{
      var options = {
          'method': 'PUT',
          'url':`https://management.azure.com/subscriptions/${reqData.subscriptionId}/resourcegroups/${reqData.resource.resourceGroup}/providers/Microsoft.Network/connections/${reqData.connection.name}?api-version=2020-04-01`,
          'headers': {
              'Authorization': authToken,
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({
              "properties": {
                  "virtualNetworkGateway1": {
                  "id": reqData.vnetGatewayID,
                  "location": reqData.VirtualNet.virNetLocation
                  },
                  "localNetworkGateway2": {
                  "id": reqData.localnetGatewayId ,
                  "location": reqData.VirtualNet.virNetLocation
                  },
                  "connectionType": "IPsec",
                  "connectionProtocol": "IKEv2",
                  "routingWeight": 0,
                  "dpdTimeoutSeconds": 30,
                  "sharedKey": reqData.connection.sharedKey,
                  "enableBgp": false,
                  "usePolicyBasedTrafficSelectors": false,
                  "ipsecPolicies": [],
                  "trafficSelectorPolicies": []

          },
  "location":  reqData.VirtualNet.virNetLocation
})
      };
      console.log("-----------connection-------------")
      request(options, function (error, response) {
          if (!error && (response.statusCode == 201 || response.statusCode == 200)){
              resolve({
                  "statusCode" : response.statusCode,
                  "body" : JSON.parse(response.body)
              })
          }
          else if(response.statusCode == 429) {
            console.log("------------here-------------in 429")
            connection(reqData,authToken)
          }else{

              console.log(response.body)
              reject({"Error":error})
          }

  })
})
}
//Site to Site Orchestration 
exports.sitetositeorchestration= async(req) => {
    return new Promise(async(resolve,reject)=>{
    try{
      reqData = req.body
      authToken = req.header('Authorization')
      var vnetID;
      //Request payload for Virtual network for MS API
      vnetbody = {
          "properties": {
            "addressSpace": {
              "addressPrefixes": [
                reqData.VirtualNet.virNetAddress
              ]
            },
            "subnets": [
              {
                "name": reqData.VirtualNet.subnetName,
                "properties": {
                  "addressPrefix": reqData.VirtualNet.subnetAddress
                }
              },
              {
                "name": "GatewaySubnet",
                "properties": {
                  "addressPrefix": reqData.VirtualNet.getSubnetAddress
                }
              }
            ]
          },
          "location": reqData.VirtualNet.virNetLocation
      }
      //Deploy virtual network
      await vNet(reqData.VirtualNet.virNetName,reqData,vnetbody,authToken).then(async(results)=>{ //Deploy Virtual Network
          vnetID = results.body.id + "/subnets/GatewaySubnet" //  Gateway Subnet ID
          var publicID;
          //Request payload for PublicIP for MS API
          publicIPBody = {   
              "properties": {
                "publicIPAllocationMethod": "Dynamic",
                "idleTimeoutInMinutes": 10,
                "publicIPAddressVersion": "IPv4"
              },
              "sku": {
                "name": "Basic"
              },
              "location": reqData.VirtualNet.virNetLocation
          }
          //Deploy Public IP
          await publicIP(reqData,publicIPBody,authToken).then(async(results)=>{
              console.log("results---",results)
              publicID = results.body.id //PublicIP id

              var localGwtID;
              //Request payload for local network gateway for MS API
              localGatewayBody = {
                  "properties": {
                    "localNetworkAddressSpace": {
                      "addressPrefixes": [
                        reqData.localConfig.addressSpace
                      ]
                    },
                    "gatewayIpAddress": reqData.localConfig.IPAddress
                  },
                  "location":  reqData.VirtualNet.virNetLocation
              }
              // Deploy Local network gateway
              await localNetGateway(reqData,localGatewayBody,authToken).then(async(results)=>{
                  console.log("results---",results)
                  localGwtID = results.body.id // local network gateway ID

                  var virtualNetGatewayID;
                  //Request payload for virtual network gateway for MS API
                  gatewayBody = {
                      "properties": {
                        "ipConfigurations": [
                          {
                            "properties": {
                              "privateIPAllocationMethod": "Dynamic",
                              "subnet": {
                                "id": vnetID
                              },
                              "publicIPAddress": {
                                "id": publicID
                              }
                            },
                            "name": reqData.virtualNetConfig.gatewayName
                          }
                        ],
                        "gatewayType": "Vpn",
                        "vpnType": "RouteBased",
                        "enableBgp": false,
                        "activeActive": false,
                        "enableDnsForwarding": false,
                        "sku": {
                          "name": reqData.virtualNetConfig.SKU,
                          "tier": reqData.virtualNetConfig.SKU
                        }
                      },
                      "location":  reqData.VirtualNet.virNetLocation
                  }
                  //Deploy Virtual network gateway
                  await virtualNetGateway(gatewayBody,reqData,authToken).then(async(results)=>{
                      virtualNetGatewayID = results.body.id
                      console.log("results--->",virtualNetGatewayID)
                      resolve({
                          "status":201,
                          "virtualNetGatewayID":virtualNetGatewayID,
                          "localGwtID":localGwtID
              
                      })
                  }).catch((err)=>{ //Error in Virtual network gateway
                      reject({"status":400,"body":err})
                  })
              }).catch((err)=>{ // Error in Local network gateway
                  reject({"status":400,"body":err})
              })
          }).catch((err)=>{ // Error in deploying Public IP
              reject({"status":400,"body":err})
          })
      }).catch((err)=>{ // Error in deploying virtual network
          console.log(err)
          reject({"status":400,"body":err})                    
      })
    }catch(err){
            console.log(err)
            reject({"Error":"Error in fetching status.Try Again!"})
        }
    })
}
//Checking availability of S2S and P2S and make Connection in S2S if Virtual Network Gateway is up
exports.checkVNetGatewayAvailability= async(req,res) => {
        try{
          reqData = req.body
          authToken = req.header('Authorization')
          //check wether the virtual network gateway is deployed or not
          url = `https://management.azure.com/subscriptions/${reqData.subscriptionId}/resourcegroups/${reqData.resource.resourceGroup}/providers/Microsoft.Network/virtualNetworkGateways/${reqData.virtualNetConfig.gatewayName}?api-version=2020-04-01`
          await getAvailability(url,authToken).then(async(results)=>{
            console.log(results)
              if(results.properties.provisioningState == "Succeeded" && reqData.localnetGatewayId){
                //if provisioning state is succeeded 
                //Make connection between Virtual network gateway and local network gateway
                  await connection(reqData,authToken).then((results)=>{
                      res.send({"status":"Succeeded",
                      "connection":"Done"})
                  }).catch(err =>{
                      res.status(400).send({"error":"Failed"})
                  })
              }
              else{
                  //if provisioning state other than succeeded
                  res.send({"status":results.properties.provisioningState})
              }
      
          })

        }catch(err){
          console.log(err)
            res.status(404).send({"Error":"Please Try Again!!"})

        }
}
//-------- Site to Site Deployment completed with connection------

//Point to Site Orchestration 
exports.pointtositeOrchestration = async(req)=>{
    return new Promise(async(resolve,reject) =>{
        try{
          reqData = req.body
          authToken = req.header('Authorization')
          var vnetID;
          //Request payload for Virtual network for MS API
          vnetBody = {
              "properties": {
                "addressSpace": {
                  "addressPrefixes": [
                    reqData.VirtualNet.virNetAddress
                  ]
                },
                "subnets": [
                  {
                    "name": reqData.VirtualNet.subnetName,
                    "properties": {
                      "addressPrefix": reqData.VirtualNet.subnetAddress
                    }
                  },
                  {
                    "name": "GatewaySubnet",
                    "properties": {
                      "addressPrefix": reqData.VirtualNet.getSubnetAddress
                    }
                  }
                ]
              },
              "location": reqData.VirtualNet.virNetLocation
          }
          //Deploy virtual network
          await vNet(reqData.VirtualNet.virNetName,reqData,vnetBody,authToken).then(async(results)=>{
              console.log("results---",results)
              vnetID = results.body.id + "/subnets/GatewaySubnet" //gateway subnet ID
              console.log("VnetID---->",vnetID)
              var publicID;
              //Request payload for Public IP for MS API
              publicIPBody = {
                  "properties": {
                    "publicIPAllocationMethod": "Dynamic",
                    "idleTimeoutInMinutes": 10,
                    "publicIPAddressVersion": "IPv4"
                  },
                  "sku": {
                    "name": "Basic"
                  },
                  "location": reqData.VirtualNet.virNetLocation
              }
              //Deploy Public IP
              await publicIP(reqData,publicIPBody,authToken).then(async(results)=>{
                  console.log("results---",results)
                  publicID = results.body.id  //publicIP ID
                  //Virtual network gateway request payload
                  var virtualNetGatewayID;
                  gatewayBody = {
                      "properties": {
                        "ipConfigurations": [
                          {
                            "properties": {
                              "privateIPAllocationMethod": "Dynamic",
                              "subnet": {
                                "id": vnetID
                              },
                              "publicIPAddress": {
                                "id": publicID
                              }
                            },
                            "name": reqData.virtualNetConfig.gatewayName
                          }
                        ],
                        "gatewayType": "Vpn",
                        "vpnType": "RouteBased",
                        "enableBgp": false,
                        "activeActive": false,
                        "enableDnsForwarding": false,
                        "sku": {
                          "name": reqData.virtualNetConfig.SKU,
                          "tier": reqData.virtualNetConfig.SKU
                        },
                        "vpnClientConfiguration": {
                        "vpnClientAddressPool": {
                        "addressPrefixes": [
                        reqData.p2sConfig.addressSpace
                        ]
                        },
                        "vpnClientProtocols": [
                        "IkeV2"
                        ],
                        "vpnClientRootCertificates": [
                        {
                        "name": reqData.p2sConfig.rootCertificate,
                        "properties": {
                        "publicCertData": reqData.p2sConfig.certificateData
                        }
                        }
                        ],
                        "vpnClientRevokedCertificates": [],
                        "radiusServers": [],
                        "vpnClientIpsecPolicies": []
                        }
                      },
                      "location":  reqData.VirtualNet.virNetLocation
                  }
                  //Deploy virtual network Gateway
                  await virtualNetGateway(gatewayBody,reqData,authToken).then(async(results)=>{
                      virtualNetGatewayID = results.body.id
                      console.log("results--->",virtualNetGatewayID)
                      resolve({
                          "status":201,
                          "virtualNetGatewayID":virtualNetGatewayID,
                      })
                  }).catch((err)=>{ //Error in virtual network Gateway
                      reject({"status":400,"body":err})
                  
                  })
              }).catch((err)=>{  //Error in Public IP
                  reject({"status":400,"body":err})
              })
          }).catch((err)=>{    // Error in vnet
              reject({"status":400,"body":err})
          })
        }catch(err){
            console.log("-----Error->",err)
            reject(err)
        }

    })
}
//Virtual Network Orchestration 
exports.virtualNetworkOrchestration = async(req)=>{
    return new Promise(async(resolve,reject) =>{
        try{
          reqData = req.body
          authToken = req.header('Authorization')
          var vnetID;
          //request body in MS API
          bodyTest = requestBody.vnetBody
          bodyTest.properties.addressSpace.addressPrefixes = [reqData.Vnet.virNetAddress]
          bodyTest.properties.subnets[0].name = reqData.Vnet.subnetName
          bodyTest.properties.subnets[0].properties.addressPrefix = reqData.Vnet.subnetAddress
          bodyTest.location = reqData.Vnet.virNetLocation
          vnetBody = {
              "properties": {
                "addressSpace": {
                  "addressPrefixes": [
                    reqData.Vnet.virNetAddress
                  ]
                },
                "subnets": [
                  {
                    "name": reqData.Vnet.subnetName,
                    "properties": {
                      "addressPrefix": reqData.Vnet.subnetAddress
                    }
                  }
                ]
              },
              "location": reqData.Vnet.virNetLocation
          }
          //call Vnet to deploy the vnet in the particular RG
          await vNet(reqData.Vnet.virNetName,reqData,bodyTest,authToken).then(async(results)=>{
              console.log("results---",results)
              vnetID = results.body.id
              console.log("VnetID---->",vnetID)
              resolve({
                  "status":201,
                  "vnetID":vnetID
              })
          }).catch((err)=>{
              console.log("--- error in vnet---")
              reject({"status":400,"body":err})
          })
        }catch(err){
            console.log("--- try-catch error---")
            reject({"status":404,"body":err})
        }
    })
}
//Virtual Network Peering Orchestration  
exports.virtualNetworkPeeringOrchestration = async(req)=>{
    return new Promise(async(resolve,reject) =>{
        try{
          reqData = req.body
          authToken = req.header('Authorization')
          var vnetID1;
          //Request payload for first Virtual network for MS API
          vnetBody1 = {
              "properties": {
                "addressSpace": {
                  "addressPrefixes": [
                    reqData.Vnet1.virNetAddress
                  ]
                },
                "subnets": [
                  {
                    "name": reqData.Vnet1.subnetName,
                    "properties": {
                      "addressPrefix": reqData.Vnet1.subnetAddress
                    }
                  }
                ]
              },
              "location": reqData.Vnet1.virNetLocation
          }
          //Deploy first vnet
          await vNet(reqData.Vnet1.virNetName,reqData,vnetBody1,authToken).then(async(results)=>{
              vnetID1 = results.body.id // first vnet ID
              console.log("VnetID1---->",vnetID1)
            //Request payload for second Virtual network for MS API
              var vnetID2;
              vnetBody2 = {
                  "properties": {
                  "addressSpace": {
                      "addressPrefixes": [
                      reqData.Vnet2.virNetAddress
                      ]
                  },
                  "subnets": [
                      {
                      "name": reqData.Vnet2.subnetName,
                      "properties": {
                          "addressPrefix": reqData.Vnet2.subnetAddress
                      }
                      }
                  ]
                  },
                  "location": reqData.Vnet2.virNetLocation
              }
              //Deploy second vnet
              await vNet(reqData.Vnet2.virNetName,reqData,vnetBody2,authToken).then(async(results)=>{
                  console.log("results---",results)
                  vnetID2 = results.body.id // second vnet ID
                  console.log("VnetID2---->",vnetID2)
                  var peeringId;
                  //Request payload for vnet peering for MS API vnet1 to vnet2
                  peeringBody = {
                      "properties": {
                        "allowVirtualNetworkAccess": true,
                        "allowForwardedTraffic": true,
                        "allowGatewayTransit": false,
                        "useRemoteGateways": false,
                        "remoteVirtualNetwork": {
                          "id": vnetID2
                        }
                      }
                    }
                  await vnetPeering(reqData.Vnet1.virNetName,reqData,peeringBody,reqData.vnetConfig.vn1vn2,authToken).then(async(results)=>{
                    //Request payload for vnet peering for MS API vnet2 to vnet1  
                    peeringBody = {
                          "properties": {
                            "allowVirtualNetworkAccess": true,
                            "allowForwardedTraffic": true,
                            "allowGatewayTransit": false,
                            "useRemoteGateways": false,
                            "remoteVirtualNetwork": {
                              "id": vnetID1
                            }
                          }
                        }
                        await vnetPeering(reqData.Vnet2.virNetName,reqData,peeringBody,reqData.vnetConfig.vn2vn1,authToken).then(async(results)=>{
                              resolve({
                                  "status":201,
                                  "state":"success"
                              })
                        }).catch((err)=>{     //error in vnet2tovnet1
                            console.log("error in vnet2tovnet1")
                            console.log(err)
                              reject({"status":400,"body":err})
                        })

                  }).catch((err)=>{        //error in vnet1tovnet2
                      console.log("error in vnet1tovnet2")
                      console.log(err)
                      reject({"status":400,"body":err})
                  })
              }).catch((err)=>{            //error in vnet2
                  console.log("--- error in vnet2---")
                  reject({"status":400,"body":err})
              })
          }).catch((err)=>{             //error in vnet1
              console.log("--- error in vnet1---")
              reject({"status":400,"body":err})
          })
        }catch(err){
            console.log("--- try-catch error---")
            reject(err)
        }
    })
}
//Express Route Orchestration 
exports.ExpressRouteOrchestration = async(req)=>{
    return new Promise(async(resolve,reject) =>{
        try{
          reqData = req.body
          authToken = req.header('Authorization')
          var vnetID;
          //Request body for virtual network for MS API
          vnetBody = {
              "properties": {
                "addressSpace": {
                  "addressPrefixes": [
                    reqData.VirtualNet.virNetAddress
                  ]
                },
                "subnets": [
                  {
                    "name": reqData.VirtualNet.subnetName,
                    "properties": {
                      "addressPrefix": reqData.VirtualNet.subnetAddress
                    }
                  },
                  {
                    "name": "GatewaySubnet",
                    "properties": {
                      "addressPrefix": reqData.VirtualNet.getSubnetAddress
                    }
                  }
                ]
              },
              "location": reqData.VirtualNet.virNetLocation
          }
          //Deploy Vnet
          await vNet(reqData.VirtualNet.virNetName,reqData,vnetBody,authToken).then(async(results)=>{
              console.log("results---",results)
              vnetID = results.body.id + "/subnets/GatewaySubnet" // Gateway subnet ID
              console.log("VnetID---->",vnetID)
              var publicID;
              //Request body for public IP for MS API
              publicIPBody = {
                  "properties": {
                    "publicIPAllocationMethod": "Dynamic",
                    "idleTimeoutInMinutes": 10,
                    "publicIPAddressVersion": "IPv4"
                  },
                  "sku": {
                    "name": "Basic"
                  },
                  "location": reqData.VirtualNet.virNetLocation
              }
              //Deploy PublicIP
              await publicIP(reqData,publicIPBody,authToken).then(async(results)=>{
                  console.log("results---",results)
                  publicID = results.body.id
                  //request payload for express route for MS API
                  expressBody={
                    "sku": {
                      "name": reqData.expressConfig.SKU+"_"+reqData.expressConfig.billingModel,
                      "tier": reqData.expressConfig.SKU,
                      "family": reqData.expressConfig.billingModel
                    },
                    "properties": {
                      "authorizations": [],
                      "peerings": [],
                      "allowClassicOperations": false,
                      "serviceProviderProperties": {
                        "serviceProviderName": reqData.expressConfig.providerName,
                        "peeringLocation": reqData.expressConfig.peeringLocation,
                        "bandwidthInMbps": reqData.expressConfig.bandwidth
                      }
                    },
                    "location": reqData.VirtualNet.virNetLocation
                  }
                  
                  await expressRoute(reqData,expressBody,authToken).then(async(results)=>{
                    //virtual network gateway request Payload
                      vnetgatewayBody={
                          "properties": {
                            "ipConfigurations": [
                              {
                                "properties": {
                                  "privateIPAllocationMethod": "Dynamic",
                                  "subnet": {
                                    "id": vnetID
                                  },
                                  "publicIPAddress": {
                                    "id": publicID
                                  }
                                },
                                "name": reqData.virtualNetConfig.gatewayName
                              }
                            ],
                            "gatewayType": "ExpressRoute",
                            "vpnType": "RouteBased",
                            "enableBgp": false,
                            "activeActive": false,
                            "enableDnsForwarding": false,
                            "sku": {
                              "name": reqData.virtualNetConfig.SKU,
                              "tier": reqData.virtualNetConfig.SKU
                            }
                          },
                          "location": reqData.VirtualNet.virNetLocation
                        
                        }
                        //Deploy virtual network gateway
                      await virtualNetGateway(vnetgatewayBody,reqData,authToken).then(async(results)=>{
                          resolve({
                              "status":201,
                              "gatewayID":results.body.id
                          })

                      }).catch((err)=>{//error in virtualNetGateway
                          reject({"status":400,"body":err})
                      })
                  }).catch((err)=>{ // Error in express route
                      reject({"status":400,"body":err})
                  })
              }).catch((err)=>{//error in publicip
                  reject({"status":400,"body":err})
              }) 
          }).catch((err)=>{ //error in vnet
              console.log("--- error in vnet---")
              reject({"status":400,"body":err})
          })
        }catch(err){
            console.log("--- try-catch error---")
            reject({"status":404,"body":err})
        }
    })
}
//Azure Firewall Orchestration
exports.AzureFirewallOrchestration = async(req)=>{
    return new Promise(async(resolve,reject) =>{
        try{
          reqData = req.body
          authToken = req.header('Authorization')
          var vnetID;
          //Request payload for vnet for MS API
          vnetBody = {
              "properties": {
                "addressSpace": {
                  "addressPrefixes": [
                    reqData.VirtualNet.virNetAddress
                  ]
                },
                "subnets": [
                  {
                    "name": reqData.VirtualNet.subnetName,
                    "properties": {
                      "addressPrefix": reqData.VirtualNet.subnetAddress
                    }
                  },
                  {
                    "name": "AzureFirewallSubnet",
                    "properties": {
                      "addressPrefix": reqData.VirtualNet.getSubnetAddress
                    }
                  }
                ]
              },
              "location": reqData.VirtualNet.virNetLocation
          }
          //Deplo Vnet
          await vNet(reqData.VirtualNet.virNetName,reqData,vnetBody,authToken).then(async(results)=>{
              console.log("results---",results)
              vnetID = results.body.id + "/subnets/AzureFirewallSubnet" //firewall subnet ID
              console.log("VnetID---->",vnetID)

              var publicID;
              //Request payload for PublicIP for MS API
              publicIPBody = {
                  "properties": {
                    "publicIPAllocationMethod": "Static",
                    "idleTimeoutInMinutes": 10,
                    "publicIPAddressVersion": "IPv4"
                  },
                  "sku": {
                    "name": "Standard"
                  },
                  "location": reqData.VirtualNet.virNetLocation
              }
              //Deploy Public API
              await publicIP(reqData,publicIPBody,authToken).then(async(results)=>{
                publicID = results.body.id
                //Request payload for  Azure Firewall for MS API
                firewallBody={
                    "location": reqData.firewallConfig.firewallLocation,
                    "zones": [],
                    "properties": {
                      "sku": {
                        "name": "AZFW_VNet",
                        "tier": "Standard"
                      },
                      "threatIntelMode": "Alert",
                      "ipConfigurations": [
                        {
                          "name": reqData.firewallConfig.firewallName+"-Configuration",
                          "properties": {
                            "subnet": {
                              "id": vnetID
                            },
                            "publicIPAddress": {
                              "id": publicID
                            }
                          }
                        }
                      ]
                      
                    }
                }
                  await azureFirewall(reqData,firewallBody,authToken).then(async(results)=>{
                      resolve(results)
                  }).catch((err)=>{  //error in firewall
                      reject({"status":400,"body":err})
                  })
              }).catch((err)=>{//error in publicip
                  reject({"status":400,"body":err})
              })
          }).catch((err)=>{//error in vnet
              console.log(err)
              reject({"status":400,"body":err})
          })
        }catch(err){
            console.log("--- try-catch error---")
            reject({"status":404,"body":err})
        }
    })
}


//deleted
function checkzureFirewall(reqData,authToken){
  return new Promise(async(resolve,reject)=>{
    var options = {
      'method': 'GET',
      'url':`https://management.azure.com/subscriptions/${reqData.subscriptionId}/resourceGroups/${reqData.resourceGroupName}/providers/Microsoft.Network/azureFirewalls/${reqData.azureFirewallName}?api-version=2020-05-01`,
      'headers': {
          'Authorization': authToken,
          'Content-Type': 'application/json'
      }
  };
    request(options, function (error, response) {
      if (!error && response.statusCode == 200){
        body = JSON.parse(response.body)
        resolve(
            {"status":body.properties.provisioningState}
        )
      }else if(!error && response.statusCode >= 400){
        reject(JSON.parse(response.body))
    }else{
      console.log(error)
      reject(error)
  }

  })

  })
}

exports.firewallAudit = async(req,res)=>{
try{
  reqData = req.body
  authToken = req.header('Authorization')
  await checkzureFirewall(reqData,authToken).then(async(results)=>{
      console.log("value----->" ,results)
      res.send(results)
  }).catch(err=>{
      res.status(400).send(err)
  })
}catch(err){
  res.status(404).send(err)
}

}

// check virtual network gateway availability
function checkVirtualNetGateway(reqData,authToken){
  return new Promise((resolve,reject)=>{
      var options = {
          'method': 'GET',
          'url':`https://management.azure.com/subscriptions/${reqData.subscriptionId}/resourcegroups/${reqData.resource.resourceGroup}/providers/Microsoft.Network/virtualNetworkGateways/${reqData.virtualNetConfig.gatewayName}?api-version=2020-04-01`,
          'headers': {
              'Authorization': authToken,
              'Content-Type': 'application/json'
          }
      };
      console.log("--------------------checking ----")
      request(options, function (error, response) {
          if (!error && response.statusCode == 200){
              resolve({
                  "statusCode" : response.statusCode,
                  "body" : JSON.parse(response.body)
              })
              
          }else if(!error && response.statusCode >= 400){
            reject(JSON.parse(response.body))
        }else{
          console.log(error)
          reject(error)
      }

  })
})

}
