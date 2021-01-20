var request = require('request');

function getWorkspaceAvailability(req,res) {
    try {
        var reqData = req.body
        return new Promise((resolve,reject)=>{
            var options = {
                'method': 'GET',
                'url': `https://management.azure.com/subscriptions/${reqData.subscriptionId}/resourceGroups/${reqData.rg_name}/providers/Microsoft.DesktopVirtualization/workspaces/${reqData.workspace_name}?api-version=2019-12-10-preview`,
                'headers': {
                    'Authorization': `${req.headers.authorization}`
                }
            };
            request(options, function (error, response) {            
                if (!error && response.statusCode == 200){
                    res.send(JSON.parse(response.body))
                }else if(!error && response.statusCode <=500){
                    res.status(400).send({"status": JSON.parse(response.body)})
                }else{
                    console.log('Error occurred: ',error)
                    res.status(400).send({"Error":"Not Available"})
                }            
            });
        })
    }catch(error) {
        console.log(error)
        res.status(404).send({"Error":"Not Available.Please Try Again!!"})
    }    
}

//Getting existing Vnets in WVDI
function listOfExistingVnet(req,res) {
    try {
        var reqData = req.body
            var options = {
                'method': 'GET',
                'url': `https://management.azure.com/subscriptions/${reqData.subscriptionId}/providers/Microsoft.Network/virtualNetworks?api-version=2020-05-01`,
                'headers': {
                    'Authorization': `${req.headers.authorization}`
                }
            };
            request(options, function (error, response) {            
                if (!error && response.statusCode == 200){
                    res.send(JSON.parse(response.body))
                }else if(!error && response.statusCode <=500){
                    res.send({"status": JSON.parse(response.body)})
                }else{
                    console.log('Error occurred: ',error)
                    res.send({"Error":"Not Available"})
                }            
            });
    }catch(error) {
        console.log(error)
        throw error;
    }    
}

module.exports = { getWorkspaceAvailability,listOfExistingVnet}