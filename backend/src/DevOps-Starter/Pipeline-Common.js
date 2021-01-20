require('dotenv').config();
var request = require('request');

function runPipelineCommon(url,patToken,body){
    return new Promise((resolve,reject)=>{
        //patToken = "zyiyfrrajxmwojogvgn3xdfa2xnmuz5ntm6oncds7cmq6ex4eexa"
        var options = {
            'method': 'POST',
            'url':url,
            'headers': {
                'Authorization': "Basic " + Buffer.from(patToken+":"+patToken).toString("base64"),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        };
        request(options, function (error, response) { 
            if (!error && (response.statusCode == 200 || response.statusCode == 201 || response.statusCode == 202)){
                resolve(JSON.parse(response.body))
            }else if (!error && response.statusCode>=400){
                reject(JSON.parse(response.body))
            }else{
                reject({"Error":"Error in release Pipeline"})
            }

    })
})
}

function getPipelineDetails(url,patToken){
    //patToken = "zyiyfrrajxmwojogvgn3xdfa2xnmuz5ntm6oncds7cmq6ex4eexa"
    return new Promise((resolve,reject)=>{
        var options = {
            'method': 'GET',
            'url':url,
            'headers': {
                'Authorization': "Basic " + Buffer.from(patToken+":"+patToken).toString("base64")
            }
        };
        request(options, function (error, response) { 
            if (!error && (response.statusCode == 200 || response.statusCode == 201 || response.statusCode == 202)){
                resolve(JSON.parse(response.body))
            }else if (!error && response.statusCode>=400){
                reject(response.body)
            }else{
                reject({"Error":"Error in getting Queus"})
            }

    })
})
}

module.exports = {runPipelineCommon,getPipelineDetails}