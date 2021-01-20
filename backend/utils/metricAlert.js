//DELETED----------------------

var request = require('request');
//const {get_token} = require('./access_token')
const credentials = require('./Credentials')
const authentication = require('./access_token')
var bearerToken;
async function getAlert(url){
    //console.log(input)
    return new Promise((resolve,reject)=>{
            var options = {
                'method': 'GET',
                'url':url,
                'headers': {
                    'Authorization': `Bearer ${bearerToken}`,
                    'Content-type': 'application/json'
                },
            }
             request(options, function (error, response) {
                    if (error) throw new Error(error);
                    if(!error && response.statusCode >= 200){
                        resolve(JSON.parse(response.body)) 
                    }
                }) 

        })
    


    // if(input.type=='Virtual Machine'){
    //     var options = {
    //         'method': 'GET',
    //         'url':"https://management.azure.com/subscriptions/"+input.SubsID+"/resourceGroups/"+input.RGName+"/providers/Microsoft.Compute/virtualMachines/"+input.VMname+"/providers/Microsoft.Insights/metrics?api-version=2018-01-01&aggregation="+input.priority+"&interval="+input.interval+"&metricnames="+input.metricName,
    //         'headers': {
    //             'Authorization': `Bearer ${bearerToken}`,
    //             'Content-type': 'application/json'
    //         },
    //     }
    //     request(options, function (error, response) {
    //         if (error) throw new Error(error);
    //         callback(null,JSON.parse(response.body))
    //     })
    // }
    // if(input.type=='SQL Server '){
    //     var options = {
    //         'method': 'GET',
    //         //https://management.azure.com/subscriptions/9f6f7208-62b5-44d2-8081-d472d00b6332/resourceGroups/PrateekRG/providers/Microsoft.Sql/servers/testing68788/databases/testing878/providers/Microsoft.Insights/metrics?api-version=2018-01-01&aggregation=Average&interval=PT1M&metricnames=storage 
    //         'url':"https://management.azure.com/subscriptions/"+input.SubsID+"/resourceGroups/"+input.RGName+"/providers/Microsoft.Sql/servers/"+input.VMname+"/databases/testing878/providers/Microsoft.Insights/metrics?api-version=2018-01-01&aggregation="+input.priority+"&interval="+input.interval+"&metricnames="+input.metricName,
    //         'headers': {
    //             'Authorization': `Bearer ${bearerToken}`,
    //             'Content-type': 'application/json'
    //         },
    //     }
    //     request(options, function (error, response) {
    //         if (error) throw new Error(error);
    //         callback(null,JSON.parse(response.body))
    //     })
    // }
    // if(input.type=='Storage Accounts'){
    //     var options = {
    //         'method': 'GET',
    //         //https://management.azure.com/subscriptions/9f6f7208-62b5-44d2-8081-d472d00b6332/resourceGroups/PrateekRG/providers/Microsoft.Sql/servers/testing68788/databases/testing878/providers/Microsoft.Insights/metrics?api-version=2018-01-01&aggregation=Average&interval=PT1M&metricnames=storage 
    //         'url':"https://management.azure.com/subscriptions/"+input.SubsID+"/resourceGroups/"+input.RGName+"/providers/Microsoft.Storage/storageAccounts/"+input.VMname+"/providers/Microsoft.Insights/metrics?api-version=2018-01-01&aggregation="+input.priority+"&interval=PT1H&metricnames=UsedCapacity",
    //         'headers': {
    //             'Authorization': `Bearer ${bearerToken}`,
    //             'Content-type': 'application/json'
    //         },
    //     }
    //     request(options, function (error, response) {
    //         if (error) throw new Error(error);
    //         callback(null,JSON.parse(response.body))
    //     })
    // }
}
exports.alerts = async function (req,res){
    // console.log('here hitting this',req.body)
    var responsedata=[]
    //get_token(async function(err,data){
        const cred = await credentials.getcredentials(req.headers.id)
    const resToken = await authentication.clientCredAuthenticationForMsManagementApi(cred)
    authManagementResponse = resToken
        bearerToken = authManagementResponse["access_token"]
        console.log('recieved payload',req.body)
        if(req.body.type == 'Virtual Machine'){
            Promise.all(req.body.metricName.map(async function(ele){
                console.log('hitting for VM',req.body.VMname)
                console.log(req.body)
                // "https://management.azure.com/subscriptions/98b7f374-098f-4d1e-98d1-a2ca9fc58c4c/resourceGroups/Muskan_RG/providers/Microsoft.Compute/virtualMachines/SQLInformatica/providers/microsoft.insights/metrics?api-version=2018-01-01&metricnames=Percentage%20CPU&aggregation=Minimum&interval=PT1H&timespan=2020-05-05T07:38:00Z/2020-05-05T09:39:00Z"
               
                url = "https://management.azure.com/subscriptions/"+req.body.SubsID+"/resourceGroups/"+req.body.RGName+"/providers/Microsoft.Compute/virtualMachines/"+req.body.VMname+"/providers/Microsoft.Insights/metrics?api-version=2018-01-01&aggregation="+req.body.priority+"&interval="+req.body.interval+"&metricnames="+ele+"&timespan="+req.body.EndTime+"/"+req.body.StartTime
                resData = await getAlert(url)
                return(resData)
            })).then((results)=>{
                console.log('here results',results[1].value)
                res.send(results)
            })
        }
        if(req.body.type == 'Storage Account'){
            Promise.all(req.body.metricName.map(async function(ele){
                url ="https://management.azure.com/subscriptions/"+req.body.SubsID+"/resourceGroups/"+req.body.RGName+"/providers/Microsoft.Storage/storageAccounts/"+req.body.VMname+"/providers/Microsoft.Insights/metrics?api-version=2018-01-01&aggregation="+req.body.priority+"&interval="+req.body.interval+"&metricnames=UsedCapacity&timespan="+req.body.EndTime+"/"+req.body.StartTime,
                resData = await getAlert(url)
                return(resData)
            })).then((results)=>{
                res.send(results)
            })
        }
        if(req.body.type == 'SQL Server'){
            console.log(req.body)
            Promise.all(req.body.metricName.map(async function(ele){
                url ="https://management.azure.com/subscriptions/"+req.body.SubsID+"/resourceGroups/"+req.body.RGName+"/providers/Microsoft.Sql/servers/"+req.body.VMname+"/databases/testing878/providers/Microsoft.Insights/metrics?api-version=2018-01-01&aggregation="+req.body.priority+"&interval="+req.body.interval+"&metricnames="+ele
                resData = await getAlert(url)
                return(resData)
            })).then((results)=>{
                res.send(results)
            })
        }



    //})
   
}