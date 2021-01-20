require('dotenv').config();
var request = require('request');
var authentication = require('../../utils/access_token')
var common = require('../../utils/common')
var sql = require("mssql");
fs = require('fs');
var format = require('pg-format');
const { isNull } = require('util');
var resultantArray = []
async function postCommon(url,authToken){
    var date=new Date();
    var fromDate=new Date(date.setDate(date.getDate()-1)).toISOString().split("T")[0];
    var toDate=new Date(date.setDate(date.getDate()+15)).toISOString().split("T")[0];
    return new Promise((resolve,reject)=>{
        var options = {
            'method': 'POST',
            'url':url,
            'headers': {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "type": "Usage",
                "timeframe": "Custom",
                "timePeriod": {
                    "from": fromDate+"T00:00:00Z",
                    "to": toDate+"T00:00:00Z"
                  },
                "dataset": {
                  "granularity": "Daily",
                  "aggregation": {
                    "totalCost": {
                      "name": "Cost",
                      "function": "Sum"
                    }
                  }
                },
            "includeActualCost": true,
            "includeFreshPartialCost": true 
              })

        };
        request(options, async function(error, response) {
            console.log(response.body)
            if (!error && (response.statusCode == 200)){
                console.log(JSON.parse(response.body))
                    resolve( JSON.parse(response.body))
            }else if(!error && response.statusCode >= 400){
                    resolve(JSON.parse(response.body))
          }else{
              console.log(error)
          }

    })
})
}

async function getCredentialsForAllTenants(){
    return new Promise((resolve,reject)=>{
        var request = new sql.Request();
        request.query(`select clientId,clientSecret,tenantId,globalAdmin from admin_auth.loginauth`, async function (err, recordset){
            if(err){
                console.log(err)
                reject(err)
            }else {
                resolve(recordset.recordset)
            }
        })
})
}

async function listOfSubscriptionwithRGs(authToken){ //List of Subscription with their RGs
    return new Promise(async(resolve,reject)=>{
        console.log(process.env.user)
        bodySubscription = await common.getRequest("https://management.azure.com/subscriptions?api-version=2016-06-01", authToken)
        var subscriptionsList = JSON.parse(bodySubscription);
        console.log(subscriptionsList)
        await orchestrateEachSubscription(subscriptionsList,authToken).then((data)=>{
            resolve(data)
        }).catch(err=>{
            console.log(err)
        })
    })
}


async function orchestrateEachSubscription(list,authToken){
    return new Promise((resolve,reject)=>{
        console.log("=========>",authToken)
         Promise.all(list.value.map(async (eachSubscription)=>{
            console.log("---->",eachSubscription)
            url = `https://management.azure.com${eachSubscription.id}/providers/Microsoft.CostManagement/forecast?api-version=2019-11-01`
            pricingData = await postCommon(url,authToken)
                //console.log("pricingData-------->",pricingData)
                if(pricingData.id){
                    splittedArray = pricingData.id.split("/")
        
                    if(pricingData.properties.rows.length != 0){
                        pricingData.properties.rows.forEach(async element => {
                            parseFloat(element[0])
                            element.push(splittedArray[1])
                            resultantArray.push(element)
                            
                        });
                    }
                    if(pricingData.properties.nextLink){
                        response = await getNextlinkData(pricingData.properties.nextLink,authToken)
                    }

                }

            return(pricingData)
        })).then(results=>{ 
            //console.log(results)
            resolve(results)
     }).catch(err=>{
         console.log(err)
     })
        
    })
}

async function getNextlinkData(url,authToken){
    return new Promise(async(resolve,reject)=>{
        pricingData = await postCommon(url,authToken)
        console.log("------------pricingData-------",pricingData)
        if(pricingData.id){
            splittedArray = pricingData.id.split("/")

            if(pricingData.properties.rows.length != 0){
                pricingData.properties.rows.forEach(async element => {
                    parseFloat(element[0])
                    element.push(splittedArray[1])
                    resultantArray.push(element)  
                });
            }else{
                resolve('success')
            }
            if(pricingData.properties.nextLink){
                await getNextlinkData(pricingData.properties.nextLink,authToken).then(results=>{
                    resolve('sucess')
                }).catch(err=>{
                    console.log(err)
                })
            }else{
                resolve('success')
            }
        
            

        }else{
            resolve('success')
        }

    })
}
 async function insertIntoDatabase(){
    return new Promise(async(resolve,reject)=>{
        await truncateDataFromTable().then((response)=>{

            var request = new sql.Request();
            console.log("length",resultantArray.length)
            for(let i=0;i< resultantArray.length;i+=1000){
                query = format(process.env.insertForecastforSubscription,resultantArray.slice(i,i+1000));
                console.log(query)
                request.query(query, async function (err, recordset){
                    if(err){
                        console.log(err)
                        reject(err)
                    }else {
                        //alterTableColumnType(process.env.alterFloatForecastSubs).then(response=>{
                            resolve({"status":"success"})
                        //}).catch(err=>{
                        //     console.log(err)
                        //     reject(err)
                            
                        // })
                        
                    }
                })
            }

        }).catch(err=>{
            console.log("Error in Truncate-->")
            reject(err)
        })

})


 }


async function truncateDataFromTable() {
    return  new Promise(function (resolve, reject) {
        try{
        var request = new sql.Request();
        console.log('query processing...')
        request.query(process.env.truncateForecastforSubscription, async function(err, recordset) {
            if(err) {
                console.log(err)
                reject(err)
            }else{ 
                console.log('Truncate Processed..!!!')
                resolve('Truncate Processed..!!!') 
            }
        })
    }catch(err){
        console.log(err)
    }
    }) 
}


exports.forecastData = async()=>{
    try{
        resultantArray = []
        DetailsofAllTenants = await getCredentialsForAllTenants()
        Promise.all(DetailsofAllTenants.map(async eachTenant =>{
            try{
            resToken = await authentication.clientCredAuthenticationForMsManagementApi(eachTenant)
            authManagementResponse = resToken
            authToken = authManagementResponse["access_token"]
            listOfSubscription = await listOfSubscriptionwithRGs(authToken)
            

            return(listOfSubscription)
            }catch(err){
                console.log(err)
            }
        })).then(async results=>{
            console.log("results--------->",resultantArray.length)
            await insertIntoDatabase(resultantArray).then((response)=>{
                //res.send(response)
                console.log("Sucess------->")
            }).catch(err=>{
                //.send(err)
                console.log("error===>",err)
            })
            
        })

    }catch(err){
        console.log(err)
    }
}
