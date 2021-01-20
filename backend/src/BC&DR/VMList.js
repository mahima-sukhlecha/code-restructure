var request = require('request');

//Gret list of unprotected VMs
function getVMList(reqData,authToken){
	return new Promise((resolve,reject)=>{

	var options = {
		'method': 'GET',
		'url': `https://management.azure.com/subscriptions/${reqData.subscriptionId}/resourceGroups/${reqData.resourceGroupName}/providers/Microsoft.Compute/virtualMachines?api-version=2019-12-01`,
		'headers': {
			'Authorization': authToken,
			'Content-Type': 'application/json'
		},
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


exports.vmListOrchestration = async(req,res)=>{
	try{
		reqData = req.body
		authToken = req.header('Authorization')
		console.log(req.body)
		await getVMList(reqData,authToken).then((resData)=>{
			result = []
			resData.value.forEach(element => {
				subArray={}
				console.log("000000000000000\n\n",element)
				subArray['name'] = element.name
				subArray['id'] = element.id
				subArray['location'] = element.location
				if(element.properties.storageProfile.osDisk){
					subArray['osDiskName'] = element.properties.storageProfile.osDisk.name
					subArray['osDiskid'] = element.properties.storageProfile.osDisk.managedDisk.id
				}else if(element.properties.storageProfile.dataDisks != []){
					dataDisks = []
					element.properties.storageProfile.dataDisks.forEach(ele => {
						eachdisk={}
						eachdisk['dataDisksName'] = ele.name
						eachdisk['dataDisksid'] = ele.managedDisk.id	
						dataDisks.push(eachdisk)
					});
					subArray.push(dataDisks)

					
				}
			result.push(subArray)
				
			});

			res.send((result))
		}).catch((error)=>{
			res.status(400).send('Something Broke!'+error)
		})
	}catch(err){
		console.log(err)
		res.status(404).send('Something broke. Please Try Again !!')
	}
}	 