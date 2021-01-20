require('dotenv').config();
var request = require('request');

async function common(url,body,authToken){
    return new Promise((resolve,reject)=>{
        var options = {
            'method': 'PUT',
            'url':url,
            'headers': {
                'Authorization': `${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)

        };
        console.log("------------In common ----")

        request(options, function (error, response) {
            if (!error && (response.statusCode == 201 || response.statusCode == 200)){
                resolve({
                    "statusCode" : response.statusCode,
                    "body" : JSON.parse(response.body)
                })
            }else if(!error && response.statusCode >= 400){
                if(response.statusCode == 429) {
                    common(url,body,authToken).then(res=>{
                      resolve(res)
                    }).catch(err=>{
                      reject(err)
                    })
                  }else{
                    console.log(response.statusCode)
                    console.log(response.body)
                    reject({
                      "statusCode" : response.statusCode,
                      "body" : JSON.parse(response.body)
                  })
                  }
          }else{
            reject(error)
          }

    })
})
}
getCommon = async(url,authToken)=>{
  return new Promise((resolve,reject)=>{
      var options = {
          'method': 'GET',
          'url':url,
          'headers': {
              'Authorization': `${authToken}`,
              'Content-Type': 'application/json'
          },
      };
      console.log("-------get ----")
      console.log(options)
      request(options, function (error, response) {
          if (!error && (response.statusCode == 200 || response.statusCode == 201)){
            res  = JSON.parse(response.body)
            if(res.statuses[1].displayStatus === "VM running"){
              resolve({
                  "statusCode" : response.statusCode,
                  "body" : res.statuses[1].displayStatus
              })
            }else{
              reject({
                "statusCode" : response.statusCode,
                "body" : res.statuses[1].displayStatus
            })
            }
          }else if(!error && response.statusCode >= 400){
              console.log(response.body)
              if(response.statusCode == 429) {
                  getCommon(url,authToken).then(res=>{
                      resolve(res)
                  }).catch(err=>{
                      reject(err)
                  })
                }else{
                  console.log("---------->"+reqData.userId)
                  console.log(response.statusCode)
                  console.log(response.body)
                  reject({
                      "statusCode" : response.statusCode,
                      "body" : JSON.parse(response.body)
                  })
                }
        }else{
            console.log("cvvd jmmm")
            console.log(error)
            reject(error)
        }

  })

  })
}

exports.virtualmachineOrchestration = async(req)=>{
    return new Promise(async(resolve,reject)=>{
        try{      
          var response;
          reqData = req.body
          authToken = req.header('Authorization') 
          nsgURI = `https://management.azure.com/subscriptions/${reqData.subscriptionId}/resourceGroups/${reqData.resource.resourceGroup}/providers/Microsoft.Network/networkSecurityGroups/${reqData.virtualNet.virNetName}-NSG?api-version=2020-05-01`
          nsgBody = {
            "properties": {
              "securityRules": [
                {
                  "name": "RDP",
                  "properties": {
                    "protocol": "TCP",
                    "sourceAddressPrefix": "*",
                    "destinationAddressPrefix": "*",
                    "access": "Allow",
                    "destinationPortRange": "3389",
                    "sourcePortRange": "*",
                    "priority": 100,
                    "direction": "Inbound"
                  }
                },
                {
                  "name": "SSH",
                  "properties": {
                    "protocol": "TCP",
                    "sourceAddressPrefix": "*",
                    "destinationAddressPrefix": "*",
                    "access": "Allow",
                    "destinationPortRange": "22",
                    "sourcePortRange": "*",
                    "priority": 110,
                    "direction": "Inbound"
                  }
                }
              ]
            },
            "location": reqData.virtualNet.virNetLocation
          }
          await common(nsgURI,nsgBody,authToken).then(async(results)=>{
            vnetURI = `https://management.azure.com/subscriptions/${reqData.subscriptionId}/resourceGroups/${reqData.resource.resourceGroup}/providers/Microsoft.Network/virtualNetworks/${reqData.virtualNet.virNetName}?api-version=2020-05-01`
            vnetBody = {
              "properties": {
                "addressSpace": {
                  "addressPrefixes": [
                    reqData.virtualNet.virNetAddress
                  ]
                },
                "subnets": [
                  {
                    "name": reqData.virtualNet.subnetName,
                    "properties": {
                      "addressPrefix": reqData.virtualNet.subnetAddress,
                      "networkSecurityGroup":{
                      "id" : results.body.id
            }
                    }
                  }
                ]
              },
              "location": reqData.virtualNet.virNetLocation
            }
            await common(vnetURI,vnetBody,authToken).then((results)=>{
              console.log("-->",results)
              vnetID = results.body.id+"/subnets/"+reqData.virtualNet.subnetName
              Promise.all(reqData.virtualMC.items.map(async element=>{
          
                publicIPURI = `https://management.azure.com/subscriptions/${reqData.subscriptionId}/resourceGroups/${reqData.resource.resourceGroup}/providers/Microsoft.Network/publicIPAddresses/${element.vmName}-IP?api-version=2020-05-01`
                publicIPBody = {
                    "properties": {
                      "publicIPAllocationMethod": "Dynamic",
                      "idleTimeoutInMinutes": 10,
                      "publicIPAddressVersion": "IPv4"
                    },
                    "sku": {
                      "name": "Basic"
                    },
                    "location": reqData.virtualNet.virNetLocation
                  }
                await common(publicIPURI,publicIPBody,authToken).then(async(results)=>{
                  ntwkInterfaceCardURI = `https://management.azure.com/subscriptions/${reqData.subscriptionId}/resourceGroups/${reqData.resource.resourceGroup}/providers/Microsoft.Network/networkInterfaces/${element.vmName}-NIC?api-version=2020-05-01`
                  ntwkInterfaceCardBody = {
                    "properties": {
                      "enableAcceleratedNetworking": false,
                      "ipConfigurations": [
                        {
                          "name": element.vmName+"-NIC",
                          "properties": {
                            "publicIPAddress": {
                              "id": results.body.id
                            },
                            "subnet": {
                              "id": vnetID
                            }
                          }
                        }
                      ]
                    },
                    "location": reqData.virtualNet.virNetLocation
                  }
                  await common(ntwkInterfaceCardURI,ntwkInterfaceCardBody,authToken).then(async(results)=>{
                    vmURI = `https://management.azure.com/subscriptions/${reqData.subscriptionId}/resourceGroups/${reqData.resource.resourceGroup}/providers/Microsoft.Compute/virtualMachines/${element.vmName}?api-version=2019-12-01`
                    vmBody = {
                      "location": reqData.virtualNet.virNetLocation,
                      "properties": {
                        "hardwareProfile": {
                          "vmSize": reqData.virtualMC.vmSize
                        },
                        "storageProfile": {
                          "imageReference": {
                            "sku": reqData.vmImage.sku,
                            "publisher": reqData.vmImage.publisher,
                            "version": "latest",
                            "offer": reqData.vmImage.offer
                          },
                          "osDisk": {
                            "caching": "ReadWrite",
                            "managedDisk": {
                              "storageAccountType": "Standard_LRS"
                            },
                            "name": element.vmName+"-osDisk",
                            "createOption": "FromImage"
                          }
                        },
                        "osProfile": {
                          "adminUsername": element.userName,
                          "computerName": element.computerName,
                          "adminPassword": element.password
                        },
                        "networkProfile": {
                          "networkInterfaces": [
                            {
                              "id": results.body.id,
                              "properties": {
                                "primary": true
                              }
                            }
                          ]
                        }
                      }
                    }
                    await common(vmURI,vmBody,authToken).then(async(results)=>{
                      console.log(results)
                      response = {
                        "vmName": element.vmName,
                        "id":results.body.id,
                        "userName":element.userName,
                        "password":element.password

                      }
                    }).catch((err)=>{
                      console.log("error in vm")
                      reject(err)

                    })
                  }).catch((err)=>{
                    console.log("error in ntwkinterfcew")
                    reject(err)
                  })
                }).catch((err)=>{
                  console.log("error in publicIp")
                  reject(err)
                })

                return(response)
              })).then((array)=>{
                console.log("in promise .all(then)")
                console.log(array)
                resolve(array)
              }).catch((err)=>{
                console.log("in promise .all(error)")
                console.log(err)
                reject(err)
              })
          }).catch(err=>{
              reject(err)
          })   
          }).catch(err=>{
            console.log("here----------->")
            console.log(err)
              reject(err)
          })
        }catch(err){
            console.log(err)
            reject(err)
        }

    })
}

exports.sqlonvmOrchestration = async(req)=>{
  return new Promise(async(resolve,reject)=>{
    try{      
      var response;
      reqData = req.body
      authToken = req.header('Authorization') 
      console.log(reqData.eachVMDetails)
      Promise.all(reqData.eachVMDetails.map(async element=>{
        getvmStatusURL = `https://management.azure.com/subscriptions/${reqData.subscriptionId}/resourceGroups/${reqData.resource.resourceGroup}/providers/Microsoft.Compute/virtualMachines/${element.vmName}/instanceView?api-version=2019-12-01` 
        await getCommon(getvmStatusURL,authToken).then(results=>{
          console.log("----------------",results)
          response = results
        }).catch(err=>{
          console.log("err---->",err)
          reject(err)
        })
        return(response)
      })).then(array=>{
        console.log("----------->",array)
        Promise.all(reqData.eachVMDetails.map(async ele=>{
          sqlonVMURI = `https://management.azure.com/subscriptions/${reqData.subscriptionId}/resourceGroups/${reqData.resource.resourceGroup}/providers/Microsoft.SqlVirtualMachine/sqlVirtualMachines/${ele.vmName}?api-version=2017-03-01-preview`
          sqlonBody= {
            "location": reqData.virtualNet.virNetLocation,
            "properties": {
            "virtualMachineResourceId": ele.id,
            "sqlServerLicenseType": "PAYG",
            "ServerConfigurationsManagementSettings": {
                "SQLConnectivityUpdateSettings": {
                    "ConnectivityType": "Private",
                    "Port": "1433",
                    "SQLAuthUpdateUserName": ele.userName,
                    "SQLAuthUpdatePassword": ele.password
                },
                "SQLWorkloadTypeUpdateSettings": {
                    "SQLWorkloadType": "General"
                },

                "AdditionalFeaturesServerConfigurations": {
                    "IsRServicesEnabled": "False"
                }
              }
            }
          }
          await common(sqlonVMURI,sqlonBody,authToken).then((results)=>{
            responseofsql = results
          }).catch(err=>{
            console.log(err)
            reject(err)
          })
          return(responseofsql)
        })).then(array=>{
          resolve(array)
        }).catch(err=>{
          console.log("here")
          reject(err)
        })
      }).catch(err=>{
      reject(err)
      })
          
    }catch(err){
      console.log(err)
      reject(err)
    }
  })

}