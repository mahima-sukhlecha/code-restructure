require('dotenv').config();
var authentication = require("../../utils/access_token")
const credentials = require('../../utils/Credentials')
var request = require('request');
var jwtDecode = require('jwt-decode');
var authToken
//MS graph API
function getUserslist(url){
    return new Promise((resolve,reject)=>{
        var options = {
            'method': 'GET',
            'url': url,
            'headers': {
                'Authorization': `Bearer ${authToken}`
            },
        formData: {
            'resource': 'https://graph.microsoft.com'
        }
    };
    try{
        request(options, function (error, response) {
            if(!error && response.statusCode == 200) {
                resolve(JSON.parse(response.body));
            }else if (!error && response.statusCode >= 400) {
                reject(JSON.parse(response.body));
            }else{
                reject(error)
            }
        });
    }catch(err){
        console.log(err)
        reject(err)
    }

    })
    

}
//get list of users in a tenant
//Send the list of users that comes under a single hit
//avoid the nextLink Users
//use User(Global Admin) AuthToken
exports.usersList = async function (req,res){
    try{
        await credentials.getcredentials(req.header('id')).then(async(cred)=>{
            authToken = (req.header('Authorization')).split(" ")[1]
            decodedToken = jwtDecode(authToken) //decode the access token to get username
            username = decodedToken.unique_name
            //if(username === cred.globalAdmin){
            await authentication.clientCredAuthenticationForMsGraphApi(cred).then(async(resToken)=>{
                authResponse = resToken;
                authToken = authResponse["access_token"]
                url = process.env.userListAPI
                await getUserslist(url).then((resData)=>{
                    res.send(resData.value)
                }).catch(err=>{
                    console.log(err)
                    res.status(400).send({"Error":"Error in fetching userList"})
                })
            }).catch((err)=>{
                console.log(err)
                res.status(400).send({"Error":"Error in getting acess token! Please provide the correct A3S-ID"})
            })
            // }else{
            //     res.status(401).send({"message":"User don't have the access to IAM"})
            // }
        }).catch(err=>{
            console.log("here-->",err)
            res.status(400).send({"Error":"Error in getting Credentials! Please provide the correct A3S-ID"})
        })
        
    }catch(error){
        res.status(404).send({"Error":"Please Try Again!"})
    }
    
}
//Getting list of filtered users
//filtering is done on basis of their display name
//Use client credential graph API authToken
exports.filterdUsersList = async(req,res)=>{
    try{
        await credentials.getcredentials(req.header('id')).then(async(cred)=>{
            await authentication.clientCredAuthenticationForMsGraphApi(cred).then(async(resToken)=>{
                authResponse = resToken;
                authToken = authResponse["access_token"]
                url = `https://graph.microsoft.com/v1.0/users?$select=displayName,jobTitle,mail,id,officeLocation,mobilePhone,department&$filter=startswith(displayName,'${req.query.value}')`
                await getUserslist(url).then((resData)=>{
                    res.send(resData.value)
                }).catch(err=>{
                    console.log(err)
                    res.status(400).send({"Error":"Error in fetching userList"})
                })
            }).catch(err=>{
                console.log(err)
                res.status(400).send({"Error":"Error in getting acess token! Please provide the correct A3S-ID"})
            })

        }).catch(err=>{
            console.log(err)
            res.status(400).send({"Error":"Error in getting Credentials! Please provide the correct A3S-ID"})
        })
    }catch(error){
        res.status(400).send({"response":"error"})
    }
}

exports.getUserInfoFromEmail = async(req,res)=>{
    try{
        await credentials.getcredentials(req.header('id')).then(async(cred)=>{
            await authentication.clientCredAuthenticationForMsGraphApi(cred).then(async(resToken)=>{
                authResponse = resToken;
                authToken = authResponse["access_token"]
                url = `https://graph.microsoft.com/v1.0/users?$select=displayName,jobTitle,mail,id,officeLocation,mobilePhone,department&$filter=startswith(mail,'${req.query.mail}')`
                await getUserslist(url).then((resData)=>{
                    console.log(resData)
                    res.send(resData.value)
                }).catch(err=>{
                    console.log(err)
                    res.status(400).send({"Error":"Error in fetching userList"})
                })
            }).catch(err=>{
                console.log(err)
                res.status(400).send({"Error":"Error in getting acess token! Please provide the correct A3S-ID"})
            })

        }).catch(err=>{
            console.log(err)
            res.status(400).send({"Error":"Error in getting Credentials! Please provide the correct A3S-ID"})
        })
    }catch(error){
        res.status(400).send({"response":"error"})
    }
}