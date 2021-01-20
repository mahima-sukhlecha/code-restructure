var request = require('request');

//MS API to get policy list on a given subscription
function getPolicies(subscriptionId){
	return new Promise((resolve,reject)=>{
		var options = {
		'method': 'GET',
			'url': `https://management.azure.com/subscriptions/${subscriptionId}/providers/Microsoft.Authorization/policyAssignments?api-version=2019-09-01`,
			'headers': {
			'Authorization': authToken
	}
	};
	try{
		request(options, function (error, response) { 
		if (!error && response.statusCode == 200){
			resolve(JSON.parse(response.body))
		}else if(!error && response.statusCode >= 400){
			resolve(JSON.parse(response.body))
		}else{
			reject(error)
		}
		});
	}catch(err){
		console.log("Error in Try catch",err)
		reject(err)
	}
	})
}
//Create an resultant array conatins the policy List
//correspond to each subscription
function policiesList(subArray){
	return new Promise(async (resolve,reject)=>{
		//call MS API to get policy on each subscription
		Promise.all(subArray.map(async function(subscriptionId){
			try{
			res = await getPolicies(subscriptionId)
			res['SubscriptionID'] = subscriptionId //Append Subscription Id in MS API response payload
			
			return(res)
			}catch(err){
				reject(err)
			}
		})).then(results=>{
			resolve(results)
		}).catch(err=>{
			reject(err)
		})
	});
}

//Get the list of applied policies on each subscription in the subscription List
exports.subscriptionList= async(req,res) => {
    try{
		reqData = req.body //request body conatins the subscriptionList
		authToken = req.header('Authorization')
		//Get policies List
		await policiesList(reqData.subscriptionList).then((results)=>{
			res.send(results)
		}).catch((err)=>{
			res.status(404).send({"Error":"Error in getting policyList"+err})
		})
    
    }catch(err){
        console.log(err)
        res.status(400).send({"Error":"Error in getting applied policy list.Try Again!"})
    }
}



