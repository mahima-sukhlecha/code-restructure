var request = require('request');
exports.getCommon = async(url,authToken) =>{
    return new Promise((resolve,reject)=>{
        try {
            var options = {
                'method': 'GET',
                'url': url,
                'headers': {
                    'Authorization': authToken
                }
            };
        
            request(options, function (error, response) {           
                if (!error && response.statusCode == 200){
                    resolve(JSON.parse(response.body))
                }else if(!error && response.statusCode >= 400){
                    resolve({"value":[]})
                }else{
                    reject({"Error":error})
                }          
            });
        } catch(error) {
            reject(error)
        }

    })
        
}