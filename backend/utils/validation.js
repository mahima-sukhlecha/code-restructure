var request = require('request');

async function ValidationResponse(validationinput,authToken){
    return new Promise((resolve,reject)=>{
        if(validationinput.operation === 'Container Registry Name'){
            console.log('inside this')
            var options = {
                'method': 'POST',
                'url':"https://management.azure.com/subscriptions/"+validationinput.subsID+"/providers/Microsoft.ContainerRegistry/checkNameAvailability?api-version=2019-05-01",
                'headers': {
                    'Authorization': authToken,
                    'Content-type': 'application/json'
                },


            body:JSON.stringify({name:validationinput.term,type:"Microsoft.ContainerRegistry/registries"})
        }
        try{
            request(options, function (error, response) {
                if (!error && response.statusCode == 200 || response.statusCode == 201 || response.statusCode == 202){
                    resolve(JSON.parse(response.body))
                }else if(!error && response.statusCode>= 400){
                    resolve(JSON.parse(response.body))
                }else{
                    reject(error)
                }
            })
        }catch(error){
            reject(error)
        }
        }
        if(validationinput.operation === 'Azure Data Lake Storage (ADLS) Generation 1'){
            var options = {
                'method': 'POST',
                'url':"https://management.azure.com/subscriptions/"+validationinput.subsID+"/providers/Microsoft.DataLakeStore/locations/"+validationinput.location+"/checkNameAvailability?api-version=2016-11-01",
                'headers': {
                    'Authorization': authToken,
                    'Content-type': 'application/json'
                },

            body:JSON.stringify({name:validationinput.term,type:"Microsoft.DataLakeStore/accounts"})
        }
        console.log(options);
        try{
            request(options, function (error, response) {
                if (!error && response.statusCode == 200 || response.statusCode == 201 || response.statusCode == 202){
                    resolve(JSON.parse(response.body))
                }else if(!error && response.statusCode>= 400){
                    resolve(JSON.parse(response.body))
                }else{
                    reject(error)
                }
            })
        }catch(error){
            reject(error)
        }
        }
        if(validationinput.operation === 'SQL Database Single Instance'){
            var options = {
                'method': 'POST',
                'url':"https://management.azure.com/subscriptions/"+validationinput.subsID+"/providers/Microsoft.Sql/checkNameAvailability?api-version=2014-04-01",
                'headers': {
                    'Authorization': authToken,
                    'Content-type': 'application/json'
                },

            body:JSON.stringify({name:validationinput.term,type:"Microsoft.Sql/servers"})
        }
        try{
            request(options, function (error, response) {
                if (!error && response.statusCode == 200 || response.statusCode == 201 || response.statusCode == 202){
                    resolve(JSON.parse(response.body))
                }else if(!error && response.statusCode>= 400){
                    resolve(JSON.parse(response.body))
                }else{
                    reject(error)
                }
            })
        }catch(error){
            reject(error)
        }

        }
        if(validationinput.operation === 'Azure Synapse Analytics'){
            var options = {
                'method': 'POST',
                'url':"https://management.azure.com/subscriptions/"+validationinput.subsID+"/providers/Microsoft.Sql/checkNameAvailability?api-version=2014-04-01",
                'headers': {
                    'Authorization': authToken,
                    'Content-type': 'application/json'
                },

            body:JSON.stringify({name:validationinput.term,type:"Microsoft.Sql/servers"})
        }
        try{
            request(options, function (error, response) {
                if (!error && response.statusCode == 200 || response.statusCode == 201 || response.statusCode == 202){
                    resolve(JSON.parse(response.body))
                }else if(!error && response.statusCode>= 400){
                    resolve(JSON.parse(response.body))
                }else{
                    reject(error)
                }
            })
        }catch(error){
            reject(error)
        }

        }
        if(validationinput.operation === 'SQL Database Elastic Pool'){
            var options = {
                'method': 'POST',
                'url':"https://management.azure.com/subscriptions/"+validationinput.subsID+"/providers/Microsoft.Sql/checkNameAvailability?api-version=2014-04-01",
                'headers': {
                    'Authorization': authToken,
                    'Content-type': 'application/json'
                },

            body:JSON.stringify({name:validationinput.term,type:"Microsoft.Sql/servers"})
        }
        try{
            request(options, function (error, response) {
                if (!error && response.statusCode == 200 || response.statusCode == 201 || response.statusCode == 202){
                    resolve(JSON.parse(response.body))
                }else if(!error && response.statusCode>= 400){
                    resolve(JSON.parse(response.body))
                }else{
                    reject(error)
                }
            })
        }catch(error){
            reject(error)
        }

        }
        if(validationinput.operation === 'Cosmos Database'){
            var options = {
                'method': 'HEAD',
                'url':"https://management.azure.com/providers/Microsoft.DocumentDB/databaseAccountNames/"+validationinput.term+"?api-version=2020-04-01",
                'headers': {
                    'Authorization': authToken,
                    'Content-type': 'application/json'
                },

        }
        
        try{
            request(options, function (error, response) {
                console.log("jjsadlksad",response.statusCode)
                if (!error && response.statusCode == 200 || response.statusCode == 201 || response.statusCode == 202){
                    resolve({"status":"Available"})
                }else if(!error && response.statusCode>= 400){
                    reject({"status":"Not Available"})
                }else{
                    reject(error)
                }
            })
        }catch(error){
            reject(error)
        }
        }
        if(validationinput.operation === 'Container Instance'){
            console.log(validationinput)
            var options = {
                'method': 'GET',
                'url':"https://management.azure.com/subscriptions/"+validationinput.subscriptionId+"/resourceGroups/"+validationinput.resourceGroupName+"/providers/Microsoft.ContainerInstance/containerGroups/"+ validationinput.resourceName +"?api-version=2018-10-01",
                'headers': {
                    'Authorization': authToken,
                    'Content-type': 'application/json'
                },
        }
        try{
            request(options, function (error, response) {
                if (!error && response.statusCode == 200 || response.statusCode == 201 || response.statusCode == 202){
                    resolve(JSON.parse(response.body))
                }else if(!error && response.statusCode>= 400){
                    resolve(JSON.parse(response.body))
                }else{
                    reject(error)
                }
            })
        }catch(error){
            reject(error)
        }
        }
    })
}
exports.validation = async function (req,res){
    try{
    reqData = req.body
    authToken  = req.header('Authorization')
        await ValidationResponse(reqData,authToken).then((data)=>{
            res.send(data)
        }).catch(err=>{
            res.status(400).send(err)
        })
    }catch(error){
        console.log(error)
        res.status(404).send({"Error":"Error in getting details.Please Try Again!!"})
    }
}