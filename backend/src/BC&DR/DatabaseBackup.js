var request = require('request');

function databaseBackup(reqData,authToken){
	return new Promise((resolve,reject)=>{

	var options = {
		'method': 'POST',
		'url': `https://management.azure.com/subscriptions/${reqData.subscriptionId}/resourceGroups/${reqData.resourceGroupName}/providers/Microsoft.Sql/servers/${reqData.serverName}/databases/${reqData.databaseName}/export?api-version=2014-04-01`,
		'headers': {
			'Authorization': authToken,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({"storageKeyType":"SharedAccessKey","storageKey":reqData.storageKey,"storageUri":reqData.storageUri,"administratorLogin":reqData.administratorLogin,"administratorLoginPassword":reqData.administratorLoginPassword,"authenticationType":"SQL"})

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

exports.dbBackupOrchestration = async(req,res)=>{
	try{
	reqData = req.body
	authToken = req.header('Authorization')
	await databaseBackup(reqData,authToken).then((resData)=>{
		res.send(resData)
	}).catch((error)=>{
		res.status(400).send({"Error":"Please Try Again !!"})
	})
}catch(err){
	console.log(err)
	res.status(404).send('Something broke. Please Try Again !!')

}
}	