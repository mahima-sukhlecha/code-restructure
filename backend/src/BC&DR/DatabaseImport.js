var request = require('request');
//Import Bacpoc files to new database
function importDatabaseBackup(reqData,authToken){
	return new Promise((resolve,reject)=>{

	var options = {
		'method': 'POST',
		'url': `https://management.azure.com/subscriptions/${reqData.subscriptionId}/resourceGroups/${reqData.resourceGroupName}/providers/Microsoft.Sql/servers/${reqData.name}/import?api-version=2014-04-01`,
		'headers': {
			'Authorization': authToken,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
            "databaseName": reqData.dbName,
            "edition": reqData.editionDb, 
            "serviceObjectiveName": reqData.serviceName, 
            "maxSizeBytes": reqData.sizeDb, 
            "storageKeyType": "SharedAccessKey", 
            "storageKey": reqData.storageKey, 
            "storageUri": reqData.storageUri, 
            "administratorLogin": reqData.sqlLogin, 
            "administratorLoginPassword": reqData.sqlCnfPassword, 
            "authenticationType": "SQL" 
          })

	};
	console.log(options)
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

exports.databaseBackupOrchestration = async(req,res)=>{
	try{
		reqData = req.body
		authToken = req.header('Authorization')
		await importDatabaseBackup(reqData,authToken).then((resData)=>{
			res.send(resData) 
		}).catch((err)=>{
			res.status(400).send(err)
		})
	}catch(err){
		console.log(err)
		res.status(404).send('Something broke. Please Try Again !!')
	}


}