var request = require('request');

function listOfVM(reqData,authToken){
	return new Promise((resolve,reject)=>{

	var options = {
		'method': 'GET',
		'url': `https://management.azure.com/Subscriptions/${reqData.subscriptionId}/resourceGroups/${reqData.resourceGroupName}/providers/Microsoft.RecoveryServices/vaults/${reqData.name}/backupProtectableItems?api-version=2016-12-01&$filter=backupManagementType eq 'AzureIaasVM'`,
		'headers': {
			'Authorization': authToken

		},

	};
	try{
		request(options, function (error, response) {
			if (error) throw new Error(error);
			if(!error && response.statusCode >= 200){
				resolve(response.body);

			}else{
				reject(error);
			}

		});
	}catch(err){
		console.log(err)
		reject(err)
	}
})
}

function createUpdateVM(reqData,authToken){
	return new Promise((resolve,reject)=>{
		array = reqData.protItemName.split(";")
		vmRGName = array[2]
		
	var options = {
		'method': 'PUT',
		'url': `https://management.azure.com/Subscriptions/${reqData.subscriptionId}/resourceGroups/${reqData.resourceGroupName}/providers/Microsoft.RecoveryServices/vaults/${reqData.name}/backupFabrics/Azure/protectionContainers/${reqData.protContName}/protectedItems/VM;iaasvmcontainerv2;${vmRGName};${reqData.vmName}?api-version=2019-05-13`,
		'headers': {
			'Authorization': authToken,
			'Content-Type': 'application/json'
        },
        body: JSON.stringify( {"properties": {
            "protectedItemType": "Microsoft.Compute/virtualMachines",
            "sourceResourceId": reqData.sourceId,
            "policyId": reqData.policyId
          }
        })

	};
	console.log("-------------",options)
	try{
		request(options, function (error, response) {
			if(!error && response.statusCode >= 200 && response.statusCode < 400){
				console.log('----->',response.headers['location'])
				resolve(response.headers['location']);
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

function enableBackup(url,authToken){
	return new Promise((resolve,reject)=>{

	var options = {
		'method': 'GET',
		'url': url,
		'headers': {
			'Authorization': authToken,
			'Content-Type': 'application/json'
		},

	};
	try{
		request(options, function (error, response) {
			if(!error && response.statusCode >= 200 && response.statusCode < 400){
				console.log('00000000000',response.body)
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

exports.virtualMachineListOrchestration = async(req,res)=>{
	try{
		reqData = req.body
		authToken = req.header('Authorization')
		await listOfVM(reqData,authToken).then((resData)=>{
			res.send(JSON.parse(resData))
		}).catch((error)=>{
			res.status(400).send('Something broke!')
		})
	}catch(err){
		console.log(err)
		res.status(404).send('Something broke. Please Try Again !!')
	}
}
exports.enableVMBackup = async(req,res)=>{
	try{
		reqData = req.body
		authToken = req.header('Authorization')
		await createUpdateVM(reqData,authToken).then(async result=>{
			console.log(result)
			if(req.body.enable){
				await enableBackup(result,authToken).then((resData)=>{
					res.send(resData)
				}).catch((error)=>{
					res.status(400).send({"Error":'Something broke!'})
				})
			}else{
				res.send(result)
			}

		}).catch(err=>{
			console.log(err)
			res.status(400).send(err)
		})
	}catch(err){
		console.log(err)
		res.status(404).send('Something broke. Please Try Again !!')
	}
	
}
