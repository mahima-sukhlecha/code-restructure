var request = require('request');

const Operation_status = (infrastructure,array)=>{
  result=[]
  
 //distinct operation names
 const distinctNames = [...new Set(array.map(x=>x.name))]
 //console.log(distinctNames)

  distinctNames.forEach(names=>{
    count_get = 0
    count_post = 0
    method=[]
   
    array.forEach(element=>{
      if(element.success === '200' && element.name === names){
        if(element.method === 'GET'){
          count_get+=1
        }
        else if(element.method === 'POST'){
          count_post+=1
        }
      }
    })
    
      
    length_get = array.filter(function(ele){return ele.method=='GET' && ele.name==names}).length
    length_post = array.filter(function(ele){return ele.method=='POST'&& ele.name==names}).length
    //console.log('count_200',(count_get+count_post))
    //console.log('total',(length_get+length_post))
    //overallStatus
    total = (count_get+count_post)/(length_get+length_post)
    if(total>=0.5){
      overallStatus="Healthy"
    }
    else if(total<=0.3){
      overallStatus="Critical"
    }
    else{
      overallStatus="Warning"
    }




    if(count_get/length_get >= 0.5){
      method.push({"Infrastructure":names,"Type":"GET","Status":200,"State":"Healthy"})
    }
    else if(count_get/length_get <= 0.3){
      method.push({"Infrastructure":names,"Type":"GET","Status":400,"State":"Critical"})
    }
    else{
      method.push({"Infrastructure":names,"Type":"GET","Status":401,"State":"Warning"})
    }

  
    if(count_post/length_post >= 0.5){
      method.push({"Infrastructure":names,"Type":"POST","Status":200,"State":"Healthy"})
    }
    else if(count_post/length_post <= 0.3){
      method.push({"Infrastructure":names,"Type":"POST","Status":400,"State":"Critical"})
    }
    else{
      method.push({"Infrastructure":names,"Type":"POST","Status":401,"State":"Warning"})
    }

     //livestatus
    result.push({
      "infrastructure":infrastructure,
      "endpoint":names,
      "overallStatus":overallStatus,
      "method":method
  })

  })
  return(result)

}



function parsedData(data){
  
  array=[]
  parsedJson = JSON.parse(data)  
  parsedJson.tables.forEach(element => {
    element.rows.forEach(els=>{
      func_name = els[3].split(" ")
      array.push({
        "name":func_name[1] ,
        "success": els[6],
        "method":func_name[0]
      })
    })
  })
  return(array)

}


exports.telemetry_data = async(resource)=>{
  	return new Promise((resolve)=>{

  	var array=[];
  	var options = {
    	'method': 'GET',
    	'url': 'https://api.applicationinsights.io/v1/apps/93c0e989-d663-4f88-a064-ffc2284bd08d/query?query=requests |where operation_Name contains '+ JSON.stringify(resource.name),
    	'headers': {
      		'x-api-key': 'fwvpteqj130rbmi4lyqpym2uegkxkied48ucn37e'
    	}
 	}
    try{
		request(options, async function (error, response) {
			if (error){
				throw new Error(error);
			}else{
				var data = response.body
				if (!error && response.statusCode == 200) {
					array = await parsedData(data)
          result = await Operation_status(resource.name,array)
          
					resolve(result)
				}else{
					resolve(null);
				}
			}		
		})
	}catch(error){
		console.log(`Can't fetch the Telemetry data`,error)
		telemetry_data(resource)
	}

})
  
}






 