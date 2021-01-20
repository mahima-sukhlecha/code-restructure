var request = require('request');

//Get Project List. If Error occurrs=> Invalid Org. (so unable to get projects.)
async function getProjectsAPI(organization,patToken){
    return new Promise((resolve,reject)=>{
        try{
            var options = {
                'method': 'GET',
                'url': `https://dev.azure.com/${organization}/_apis/projects?api-version=5.1`,
                'headers': {
                    'Authorization': "Basic " + Buffer.from(patToken+":"+patToken).toString("base64")
                }
            };
            request(options, async function (error, response) { 
                if (!error && response.statusCode == 200){
                    resolve((JSON.parse(response.body)).value)  
                }else{
                    console.log("Error in Get Project List API: ",response.body)
                    reject(response.body)  }
            });
        }catch(error) {
            console.log("Error in try-catch :",error)
            reject('Error occurred in try catch!!!')
        }	        
    })
}

//Check If the provided organization name even exists or not.
async function validateOrganizationName(req,res) {
    var organization = req.body.organization
    var patToken = req.body.patToken
    
    await getProjectsAPI(organization,patToken).then(result=>{
        var projectsList=[]
        result.forEach(element => {   //element.name => project-name
            projectsList.push(element.name)
        });
        res.send({"values":projectsList})

    }).catch(error=>{
        res.status(400).send({"status":"Invalid Organization Name or Invalid Token. Please check & retry..!!!"})
    })

    
}

module.exports = {getProjectsAPI, validateOrganizationName}