var request = require('request');

function getExistingRSVList(reqData,authToken){
	return new Promise((resolve,reject)=>{
	var options = {
		'method': 'GET',
		'url': `https://management.azure.com/subscriptions/${reqData.subscriptionId}/resourceGroups/${reqData.resourceGroupName}/providers/Microsoft.RecoveryServices/vaults?api-version=2016-06-01`,
		'headers': {
			'Authorization': authToken,
			'Content-Type': 'application/json'
		}
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
//get list of existing Vaults in VM backuo form
exports.existingVaultsList = async(req,res)=>{
	try{
		reqData = req.body
		authToken = req.header('Authorization')
		await getExistingRSVList(reqData,authToken).then((resData)=>{
			res.send(resData)
		}).catch((error)=>{
			res.status(400).send('Something broke!')
		})
	}catch(err){
		console.log(err)
		res.status(404).send('Something broke. Please Try Again !!')
	}
	


}