require('dotenv').config();
var request = require('request');

async function clientCredAuthenticationForMsManagementApi(cred) {
  return new Promise(function (resolve, reject) {
      console.log("AuthTokenCredentials--->",cred)
      request({
          url: `https://login.microsoftonline.com/${cred.tenantId}/oauth2/token`,
          method: "POST",
          form: {
              "resource": "https://management.azure.com",
              "client_id": cred.clientId,
              "client_secret": cred.clientSecret,
              "grant_type": "client_credentials",
             
              "scope": "read"
          }
      }, function (error, response) {
          if (!error && response.statusCode == 200) {
              resolve(JSON.parse(response.body));
          } else {
              reject(JSON.parse(response.body));
          }
      });
  })
}

async function clientCredAuthenticationForMsGraphApi(cred) {
    return new Promise(function (resolve, reject) {
        console.log("AuthTokenCredentials--->",cred)
        request({
            url: `https://login.microsoftonline.com/${cred.tenantId}/oauth2/token`,
            method: "POST",
            form: {
                "resource": "https://graph.microsoft.com",
                "client_id": cred.clientId,
                "client_secret": cred.clientSecret,
                "grant_type": "client_credentials",
               
                "scope": "read"
            }
        }, function (error, response) {
            if (!error && response.statusCode == 200) {
                resolve(JSON.parse(response.body));
            } else {
                reject(JSON.parse(response.body));
            }
        });
    })
  }

module.exports = {
  clientCredAuthenticationForMsManagementApi,clientCredAuthenticationForMsGraphApi
}

