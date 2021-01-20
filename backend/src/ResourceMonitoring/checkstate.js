var request = require('request');
async function StateAPIS(input,authToken,callback){
    if(input.type === 'sites'){
        var options = {
            'method': 'GET',
            'url':"https://management.azure.com/subscriptions/"+input.SubsID+"/resourceGroups/"+input.RGName+"/providers/Microsoft.Web/sites/"+input.VMName+"?api-version=2019-08-01",
            'headers': {
                'Authorization':authToken ,
                'Content-type': 'application/json'
            }

        //  body:JSON.stringify({"name":JSON.stringify(validationinput.term),"type":"Microsoft.ContainerRegistry/registries"})
    }
    request(options, function (error, response) {
        if (error) throw new Error(error);
        callback(null,JSON.parse(response.body))
    })
    }
    if(input.type === 'workflows'){
        var options = {
            'method': 'GET',
            'url':"https://management.azure.com/subscriptions/"+input.SubsID+"/resourceGroups/"+input.RGName+"/providers/Microsoft.Logic/workflows/"+input.VMName+"?api-version=2016-06-01",
            'headers': {
                'Authorization': authToken,
                'Content-type': 'application/json'
            }

        //  body:JSON.stringify({"name":JSON.stringify(validationinput.term),"type":"Microsoft.ContainerRegistry/registries"})
    }
    request(options, function (error, response) {
        if (error) throw new Error(error);
        callback(null,JSON.parse(response.body))
    })
    }
    if(input.type == 'virtualMachines'){
        var options = {
            'method': 'GET',
            'url':"https://management.azure.com/subscriptions/"+input.SubsID+"/resourceGroups/"+input.RGName+"/providers/Microsoft.Compute/virtualMachines/"+input.VMName+"/instanceView?api-version=2019-07-01",
            'headers': {
                'Authorization': authToken,
                'Content-type': 'application/json'
            }

        //  body:JSON.stringify({"name":JSON.stringify(validationinput.term),"type":"Microsoft.ContainerRegistry/registries"})
    }
    request(options, function (error, response) {
        if (error) throw new Error(error);
        callback(null,JSON.parse(response.body))
    })
    }
    if(input.type == "containerGroups"){
        var options = { 
            'method': 'GET',
            //https://management.azure.com/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.ContainerInstance/containerGroups/{containerGroupName}?api-version=2018-10-01
            'url':"https://management.azure.com/subscriptions/"+input.SubsID+"/resourceGroups/"+input.RGName+"/providers/Microsoft.ContainerInstance/containerGroups/"+input.VMName+"?api-version=2018-10-01",
            'headers': {
                'Authorization': authToken,
                'Content-type': 'application/json'
            }
        }
        request(options, function (error, response) {
            if (error) throw new Error(error);
            callback(null,JSON.parse(response.body))
        })
    }

    if(input.type == "servers/databases"){
        var options = { 
            'method': 'GET',
            //https://management.azure.com/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Sql/servers/{serverName}/databases/{databaseName}?api-version=2017-10-01-preview
            'url':"https://management.azure.com/subscriptions/"+input.SubsID+"/resourceGroups/"+input.RGName+"/providers/Microsoft.Sql/servers/"+input.ServerName+"/databases/"+input.DBName+"?api-version=2017-10-01-preview",
            'headers': {
                'Authorization': authToken,
                'Content-type': 'application/json'
            }
        }
        request(options, function (error, response) {
            if (error) throw new Error(error);
            callback(null,JSON.parse(response.body))
        })
    }

  

    
}
exports.GetStateStatus = async function (req,res){
    try{
        authToken = req.header('Authorization')
        StateAPIS(req.body,authToken,function(err,data){
            if(err){
                console.log('error->',err)
                res.status(400).send({"Error":"Error in getting State status"})
        }
            
            var responsePayload = {
                "name": data.name,
                // "state" : data.properties.state,
                "data":data
            }
            res.send(responsePayload)
        })
}catch(err){
    res.status(400).send({"Error":"Something Wrong happened. Try Again!"})
}
}