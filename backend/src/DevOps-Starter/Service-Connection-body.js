async function connectionBody(data,cred,projectId) {
  
  var json = {
    "data": {
      "subscriptionId": data.subscriptionId,
      "subscriptionName": data.subscriptionName,
      "environment": "AzureCloud",
      "scopeLevel": "Subscription",
      "creationMode": "Manual"
    },
    "name": `${data.project}ServiceEndpoint`,
    "type": "AzureRM",
    "url": "https://management.azure.com/",
    "authorization": {
      "parameters": {
        "tenantid": cred.tenantId,
        "serviceprincipalid": cred.clientId,
        "authenticationType": "spnKey",
        "serviceprincipalkey": cred.clientSecret
      },
      "scheme": "ServicePrincipal"
    },
    "isShared": false,
    "isReady": true,
    "serviceEndpointProjectReferences": [
      {
        "projectReference": {
          "id": projectId,
          "name": data.project
        },
        "name": `${data.project}ServiceEndpoint`,
      }
    ]
  }
  
  return json
} 

module.exports = { connectionBody }