require('dotenv').config();
var request = require('request');
var authentication = require('../../utils/access_token')
var common = require('../../utils/common')
var sql = require("mssql");
fs = require('fs');
var format = require('pg-format');

var resultantArray = [] //Array storing the end result 

//Post API to get actual cost of all resources under a subscription
async function postCommon(url,authToken){
    var date=new Date();
    console.log(date)
    var toDate=new Date(date.setDate(date.getDate())).toISOString().split("T")[0]
    var fromDate=new Date(date.setDate(date.getDate()-91)).toISOString().split("T")[0];
    console.log(fromDate)
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
                  },
                  "grouping": [
                    {
                      "type": "Dimension",
                      "name": "ResourceId"
                    },
                     {
                      "type": "Dimension",
                      "name": "ResourceGroup"
                    },
                           {
                      "type": "Dimension",
                      "name": "Resourcetype"
                    },
                             {
                      "type": "Dimension",
                      "name": "SubscriptionId"
                    }
                    
                  ]
                }
               
              })

        };

        request(options, async function(error, response) {
            if (!error && (response.statusCode == 200)){
                console.log(JSON.parse(response.body))
                    resolve( JSON.parse(response.body))
            }else if(!error && response.statusCode >= 400){
                console.log(JSON.parse(response.body))
                    resolve(JSON.parse(response.body))
          }else{
              console.log(error)
          }

    })
})
}
// Get credentials from database corresponding to all A3SIDs
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

//Get list of subscription using client credentials
async function getListOfSubscription(authToken){ //List of Subscription with their RGs
    return new Promise(async(resolve,reject)=>{
        console.log(process.env.user)
        bodySubscription = await common.getRequest("https://management.azure.com/subscriptions?api-version=2016-06-01", authToken)
        var subscriptionsList = JSON.parse(bodySubscription);
        console.log(subscriptionsList)
        //Get cost for each subscription
        await orchestrateEachSubscription(subscriptionsList,authToken).then((data)=>{
            console.log("here222222222222222222222222222")
            resolve(data)
        }).catch(err=>{
            console.log(err)
        })
    })
}

//Orchestrate each subscription -getting pricing data for each subscription
async function orchestrateEachSubscription(list,authToken){
    return new Promise((resolve,reject)=>{
         Promise.all(list.value.map(async (eachSubscription)=>{
            //Costing of all resouces under a subscription
            url = `https://management.azure.com${eachSubscription.id}/providers/Microsoft.CostManagement/query?api-version=2019-11-01`
            pricingData = await postCommon(url,authToken)
                if(pricingData.id){ //check whether the response from pricing API contains id or error
                    if(pricingData.properties.rows.length != 0){ // check pricing data is avaialable or not
                        console.log("----length of pricing data ---->",pricingData.properties.rows.length)
                        pricingData.properties.rows.forEach(async element => {
                            parseFloat(element[0]) //convert cost into float from string
                            resultantArray.push(element) // Push the Pricing data in resultant array    
                        });
                    }
                    if(pricingData.properties.nextLink){ // if the response payload contains the nextLink 
                        //get the data from nextLink
                        response = await getNextlinkData(pricingData.properties.nextLink,authToken)
                        console.log("response--->",response)
                    }
                }
            return(pricingData)
        })).then(results=>{
            console.log("here---------------------->")
            resolve(results)

     }).catch(err=>{
         console.log(err)
     })
        
    })
}

//get data from the next Link
async function getNextlinkData(url,authToken){
    return new Promise(async(resolve,reject)=>{
        pricingData = await postCommon(url,authToken)
        console.log("------------pricingData-------",pricingData)
        if(pricingData.id){
            //splittedArray = pricingData.id.split("/")

            if(pricingData.properties.rows.length != 0){
                pricingData.properties.rows.forEach(async element => {
                    //element.push(splittedArray[1])
                    //console.log("in next link before--->",resultantArray.length)
                    parseFloat(element[0])
                    resultantArray.push(element)
                    //console.log("in next link after--->",resultantArray.length)  
                });
            }else{
                resolve('success1')
            }
            if(pricingData.properties.nextLink){
                await getNextlinkData(pricingData.properties.nextLink,authToken).then(results=>{
                    resolve('sucess2')
                }).catch(err=>{
                    console.log(err)
                })
            }else{
                resolve('success3')
            }
        
            

        }else{
            resolve('success4')
        }

    })
}
//Insert Pricing data into database
 async function insertIntoDatabase(){
    return new Promise(async (resolve,reject)=>{
        //Truncate the table PowerBI.resourceID from database
        await truncateDataFromTable().then((response)=>{
            var request = new sql.Request();
            console.log("length",resultantArray.length) // lenth od resultant Array
            for(let i=0;i< resultantArray.length;i+=1000){ // insert 1000 rows in a single shot
                //format the resultant array [[],[]] into ((),()) for sql query
                query = format(process.env.insertQueryPricing ,resultantArray.slice(i,i+1000));
                console.log(query)
                //Insert  pricing data into database
                request.query(query, async function (err, recordset){
                    if(err){
                        console.log(err)
                        reject(err)
                    }else {
                        resolve({"status":"success"})
                    }
                })
            }

        }).catch(err=>{
            console.log("Error in Truncate-->")
            reject(err)
        })

})


 }

//Function to truncate the database
async function truncateDataFromTable() {
    return  new Promise(function (resolve, reject) {
        var request = new sql.Request();
        console.log('query processing...')
        request.query(process.env.truncateQueryPricing, async function(err, recordset) {
            if(err) {
                console.log(err)
                reject(err)
            }else{ 
                console.log('Truncate Processed..!!!')
                resolve('Truncate Processed..!!!') 
            }
        })
    }) 
}
//Function to orchestrate the whole file 
// Get the pricing data for all resouces under a subscription
exports.pricingData = async()=>{
    try{
        resultantArray = []
        DetailsofAllTenants = await getCredentialsForAllTenants()
        Promise.all(DetailsofAllTenants.map(async eachTenant =>{
            try{
            resToken = await authentication.clientCredAuthenticationForMsManagementApi(eachTenant)
            authManagementResponse = resToken
            authToken = authManagementResponse["access_token"]
            listOfSubscription = await getListOfSubscription(authToken)
            console.log("herewwriejkjckjod")
            console.log("results--------->",resultantArray.length)
            return(listOfSubscription)
            }catch(err){
                console.log(err)
            }
        })).then(async results=>{
            console.log(results)
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
