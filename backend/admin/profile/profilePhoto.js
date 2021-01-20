var request = require('request');
const credentials = require('../../utils/Credentials')
const authentication = require('../../utils/access_token')

//Get Profile photo using API with graphAPIToken
async function profilePhotoAPI(token,email){
    try{
        return new Promise((resolve,reject)=>{
            var options = {
                'method': 'GET',
                'url': `https://graph.microsoft.com/v1.0/users/${email}/photos/360x360/$value`,
                'headers': {
                  'Authorization': `Bearer ${token}`
                }
              };
            options.encoding = null
            request(options, async function (error, response) { 
                if (!error && response.statusCode === 200){
                    var Base64image = Buffer.from(response.body).toString('base64')
                    if (Base64image.length < 1000) {
                        resolve({"status":"No Profile Picture found..!!!"})
                    }else {
                        resolve({"image":`data:image/png;base64,${Base64image}`});
                    }
                    resolve(response.body)
                }else{
                    reject({"status": JSON.parse(response.body)})  }
            });
        })
    }catch(error) {
        console.log(error)
        res.status(404).send({"status": "Error occurred..!!! Please try again."}) }	
}


exports.getProfilePhoto = async(req,res)=> {
    try{
        var a3sId = req.headers.id
        new Promise(async (resolve)=>{
            await credentials.getcredentials(a3sId).then(async cred=>{   //clientId,clientSecret,tenantId
                await authentication.clientCredAuthenticationForMsGraphApi(cred).then(async tokenData=>{  //token
                    var token = tokenData.access_token
                    await profilePhotoAPI(token,req.query.email).then(result=>{
                        res.send(result)
                    }).catch(error=>{
                        console.log("Error occurred: ",error)
                        res.status(401).send(error)
                    })
                }) 
            }).catch(error=>{
                console.log('Error: ',error)
                res.status(401).send(error)     })            
        })
    }catch(error) {
        console.log(error)
        res.status(404).send({"status": "Error occurred..!!! Please try again."})
    }	
}
