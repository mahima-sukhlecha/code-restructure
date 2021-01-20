var request = require('request');

function recoveryServiceVault(reqData,authToken){
	return new Promise((resolve,reject)=>{
	var options = {
		'method': 'PUT',
		'url': `https://management.azure.com/subscriptions/${reqData.subscriptionId}/resourceGroups/${reqData.resourceGroupName}/providers/Microsoft.RecoveryServices/vaults/${reqData.vaultName}?api-version=2016-06-01`,
		'headers': {
			'Authorization': authToken,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({"properties":{},"sku":{"name":"Standard"},"location":reqData.location,"identity":{"type":"SystemAssigned"}})

	};
	try{
		request(options, function (error, response) { 
			if(!error && response.statusCode >= 200 && response.statusCode < 400){
				resolve(JSON.parse(response.body));
			}else if(!error && response.statusCode >= 400 ){
				reject(JSON.parse(response.body))
			}
			else{
				reject(error);
			}
			
		});
	}catch(err){
		console.log(err)
		reject(err)
	}
})
}
//create recovery service vault
exports.vaultOrchestration = async(req,res)=>{
	try{
		reqData = req.body
		authToken = req.header('Authorization')
		recoveryServiceVault(reqData,authToken).then((resData)=>{
			res.send(resData)
		}).catch(err=>{
			res.status(400).send({"Error": "Error while getting data"})
		})
		
	}catch(err){
		console.log(err)
		res.status(404).send('Something broke. Please Try Again !!')
	}
	
}