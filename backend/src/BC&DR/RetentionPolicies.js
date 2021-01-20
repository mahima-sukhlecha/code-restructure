var request = require('request');

function createandUpdateRetentionPolicies(reqData,authToken){
	return new Promise((resolve,reject)=>{

	var options = {
		'method': 'PUT',
		'url': `https://management.azure.com/subscriptions/${reqData.subscriptionId}/resourceGroups/${reqData.resourceGroupName}/providers/Microsoft.Sql/servers/${reqData.serverName}/databases/${reqData.databaseName}/backupLongTermRetentionPolicies/default?api-version=2017-03-01-preview`,
		'headers': {
			'Authorization': authToken,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
            "properties": {
              "weeklyRetention": "P1M",
              "monthlyRetention": "P1Y",
              "yearlyRetention": "P5Y",
              "weekOfYear": 5
            }
          }
          )

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
//Creating policies in database
exports.retentionPoliciesOrchestration = async(req,res)=>{
	try{
		reqData = req.body
		authToken = req.header('Authorization')
		await createandUpdateRetentionPolicies(reqData,authToken).then((resData)=>{
			res.send(resData)
		}).catch((error)=>{
			res.status(400).send('Something broke!')
		})
	}catch(err){
		console.log(err)
		res.status(404).send('Something broke. Please Try Again !!')
	
	}

}