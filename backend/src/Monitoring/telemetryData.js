require('dotenv').config();
const {get_token} = require('../../utils/access_token')
var request = require('request');

const status = require('./Infrastructure_status')

//complete data
completeData = []

//get Access Token
var authToken;
exports.main = (req,res)=>{
	get_token(function(err,data){
		if (err){
		console.log('error', err)//error handling
		}else{
			authToken=data
			getProjectData().then(results=>{
				console.log(completeData)
				res.send(completeData)

				}).catch((err)=>{
					console.log("error in project return")
				})
			}
		})


}

//get Project Data
var projectResults;
projectTags = ['WEGO','RTM']
getProjectData = async()=>{
	 return new Promise(async(resolve)=>{
		 Promise.all(projectTags.map(async function(tag){
			console.log("Fetching project Data--------------------------------------------")
			var proEachtagResults = await requestProjectData(tag)
			var results = await getEnviromentData(proEachtagResults)
			return({
				'Name':tag,
				[tag]:{"Environment":results}
				
			})

		 })).then(function(results){
			completeData = []
			completeData.push(results)
			resolve(completeData)
		}).catch((err)=>{
			console.log("Error in Project Data")
		})
		

		})
	 
 }

 async function requestProjectData(tag){
	return new Promise((resolve)=>{
		var options = {
			'method': 'GET',
			'url': "https://management.azure.com/subscriptions/3406779e-e0b0-485a-8c7d-7812c9d1456d/resources?$filter=tagName eq 'Project' and tagValue eq 'WeGo'&api-version=2019-10-01",
			'headers': {
			    'Authorization': `Bearer ${authToken}`
			}
		  }
		  request(options, async function (error, response) { 
			if (error) throw new Error(error);
			data = JSON.parse(response.body)
			projectResults = data
			resolve(data)
		  });

	})

 }

//getenviroment data
var enviromentResults=[];
wegoEnviromentTags = ['QA','Prod','Dev']
count=0
getEnviromentData= async(results)=>{
	return new Promise((resolve)=>{
    Promise.all(wegoEnviromentTags.map(async function(tag){
        console.log(" Fetching enviromentResults-------------------------------------------")
		var envrEachtagResults = await requestEnvironmetData(results,tag)
		if(envrEachtagResults.length !== 0 ){
			var res = await getInterfaceData(envrEachtagResults,tag)
			if(res.length !== 0){
				return({
					'Name':tag,
					[tag]:{'Interface':res}
					
				})
			}else{
				return({
					'Name':tag,
					[tag]:{}
				})
			}
		}else{
			return({})
		}


    })).then((results)=>{
       resolve(results)
	}).catch((err)=>{
		console.log("Error in Environment data")
	})
})
	
}

// request environment data
async function requestEnvironmetData(results,tag){
	return new Promise((resolve)=>{
		var subsetResult=[]
		var options = {
			'method': 'GET',
			'url': "https://management.azure.com/subscriptions/3406779e-e0b0-485a-8c7d-7812c9d1456d/resources?$filter=tagName eq 'Environment' and tagValue eq '"+tag+"'&api-version=2019-10-01",
			'headers': {
			      'Authorization': `Bearer ${authToken}`
			}
		}
		request(options, async function (error, response) {
			if (error) {
				console.log('error in fetching env results')
			}
				 data = JSON.parse(response.body)
				 
			     data.value.forEach(array=> {
			     	results.value.forEach(element => {
			          	if(element.name === array.name){
							subsetResult.push(array)
						}
			                   
			     	});
				})
				resolve(subsetResult)
		})
	})
}

//request interface data 
async function requestInterfaceData(envrEachtagResults,intrtag){
	return new Promise(async(resolve)=>{
		var subsetResult=[]
			
			var options = {
				'method': 'GET',
				'url': "https://management.azure.com/subscriptions/3406779e-e0b0-485a-8c7d-7812c9d1456d/resources?$filter=tagName eq 'Interface' and tagValue eq '"+intrtag+"'&api-version=2019-10-01",
				'headers': {
					 'Authorization': `Bearer ${authToken}`
				}
			}
			await request(options, async function (error, response) { 
				
				if (error) throw new Error(error);
				data = JSON.parse(response.body)
				await data.value.forEach(ele=>{
					envrEachtagResults.forEach(ele2=>{
						 if(ele.name === ele2.name){
							    subsetResult.push(ele)
						  }
					 })
				})

				resolve(subsetResult)		
			})
	})
}

//interface data
var interfaceData=[];
interfaceTags = ['RCI','OKTA']
getInterfaceData= async(envrEachtagResults,envrTag)=>{
	return new Promise(async(resolve)=>{
        Promise.all(interfaceTags.map(async function(tag){
			var interfaceEachTagResults = await requestInterfaceData(envrEachtagResults,tag)
			if(interfaceEachTagResults.length !== 0){
				var BPTagResults = await getBusinessProcessData(interfaceEachTagResults)
				if(BPTagResults.length !== 0){
					return({
						'Name':tag,
						[tag]:{'BP':BPTagResults}
						
					})
				}else{
					return({
						'Name':tag,
						[tag]:{}
					})

				}
			}else{
				return({})
			}
        })).then(function(results){
            resolve(results)
        }).catch((err)=>{
			console.log("Error in Interface data")
		})
	})
	
}

//request Business Process
async function requestBusinessProcessData(interfaceEachtagResults,BPTag){
	return new Promise(async(resolve)=>{
		var subsetResult=[]
			
			var options = {
				'method': 'GET',
				'url': "https://management.azure.com/subscriptions/3406779e-e0b0-485a-8c7d-7812c9d1456d/resources?$filter=tagName eq 'BP' and tagValue eq '"+BPTag+"'&api-version=2019-10-01"	,
				'headers': {
					 'Authorization': `Bearer ${authToken}`
				}
			}
			await request(options, async function (error, response) { 
				
				if (error) throw new Error(error);
				data = JSON.parse(response.body)
				await data.value.forEach(ele=>{
					interfaceEachtagResults.forEach(ele2=>{
						 if(ele.name === ele2.name){
							    subsetResult.push(ele)
						  }
					 })
				})

				resolve(subsetResult)		
			})
	})
}    

//Business Process Data
BPTags=['DailyExport','FileIngestion','FileProcessing']
getBusinessProcessData= async(interfaceEachTagResults)=>{
	return new Promise(async(resolve)=>{
        Promise.all(BPTags.map(async function(tag){
			var dataArray=[]
			var BPEachTagResults = await requestBusinessProcessData(interfaceEachTagResults,tag)
			
			if(BPEachTagResults.length !== 0){
				
				await Promise.all(BPEachTagResults.map(async function(element){
					telemetryData= await status.telemetry_data(element)
				 	return(telemetryData)
				 })).then((dataArray1)=>{
					dataArray=dataArray1
				 })

				return({
					'Name':tag,
					[tag]:{'Infrastructure':BPEachTagResults,
						'TelemetryStatus':dataArray},
					
				})
			}else{
				return({})
			}
            
        })).then(function(results){
                resolve(results)
        }).catch((err)=>{
			console.log("error in BP Data")
		})
		
	})
	
}