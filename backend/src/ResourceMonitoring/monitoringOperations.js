var request = require('request');

async function monitorOperation(operationinput,authToken,callback){
    console.log(operationinput)
    if(operationinput.Type == 'Virtual Machine'){
        if(operationinput.operation == 'Restart'){
            var options = {
                'method': 'POST',
                'url':`https://management.azure.com/subscriptions/${operationinput.SubscriptionID}/resourceGroups/${operationinput.RGname}/providers/Microsoft.Compute/virtualMachines/${operationinput.VMname}/restart?api-version=2019-07-01`,
                'headers': {
                    'Authorization': authToken,
                    'Content-type': 'application/json'
                }
            }
            request(options, function (error, response) {
                console.log(response.statusCode)
                if (error) throw new Error(error);
                callback(null,response.statusCode)
            })
        }
        if(operationinput.operation == 'start'){
            var options = {
                'method': 'POST',
                'url':`https://management.azure.com/subscriptions/${operationinput.SubscriptionID}/resourceGroups/${operationinput.RGname}/providers/Microsoft.Compute/virtualMachines/${operationinput.VMname}/start?api-version=2019-07-01`,
                'headers': {
                    'Authorization': authToken,
                    'Content-type': 'application/json'
                }
            }
            request(options, function (error, response) {
                console.log(response.statusCode)
                if (error) throw new Error(error);
                callback(null,response.statusCode)
            })
        }
        if(operationinput.operation == 'delete'){
            var options = {
                'method': 'DELETE',
                'url':`https://management.azure.com/subscriptions/${operationinput.SubscriptionID}/resourceGroups/${operationinput.RGname}/providers/Microsoft.Compute/virtualMachines/${operationinput.VMname}?api-version=2019-07-01`,
                'headers': {
                    'Authorization': authToken,
                    'Content-type': 'application/json'
                }
            }
            request(options, function (error, response) {
                console.log(response.statusCode)
                if (error) throw new Error(error);
                callback(null,response.statusCode)
            })
        }
        if(operationinput.operation == 'stop'){
            var options = {
                'method': 'POST',
                'url':`https://management.azure.com/subscriptions/${operationinput.SubscriptionID}/resourceGroups/${operationinput.RGname}/providers/Microsoft.Compute/virtualMachines/${operationinput.VMname}/deallocate?api-version=2019-07-01`,
                'headers': {
                    'Authorization': authToken,
                    'Content-type': 'application/json'
                }
            }
            request(options, function (error, response) {
                console.log(response.statusCode)
                if (error) throw new Error(error);
                callback(null,response.statusCode)
            })
        }
    }
    if(operationinput.Type == 'Virtual Network Gateway'){
        if(operationinput.operation == 'delete'){
            var options = {
                'method': 'DELETE',
                'url':`https://management.azure.com/subscriptions/${operationinput.SubscriptionID}/resourceGroups/${operationinput.RGname}/providers/Microsoft.Network/virtualNetworkGateways/${operationinput.VMname}?api-version=2020-03-01`,
                'headers': {
                    'Authorization': authToken,
                    'Content-type': 'application/json'
                }
            }
            request(options, function (error, response) {
                console.log(response.statusCode)
                if (error) throw new Error(error);
                callback(null,response.statusCode)
            })
        }
    } 
    if(operationinput.Type == 'Local Network Gateway'){
        if(operationinput.operation == 'delete'){
            var options = {
                'method': 'DELETE',
                //https://management.azure.com/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Network/localNetworkGateways/{localNetworkGatewayName}?api-version=2020-03-01
                'url':`https://management.azure.com/subscriptions/${operationinput.SubscriptionID}/resourceGroups/${operationinput.RGname}/providers/Microsoft.Network/localNetworkGateways/${operationinput.VMname}?api-version=2020-03-01`,
                'headers': {
                    'Authorization': authToken,
                    'Content-type': 'application/json'
                }
            }
            request(options, function (error, response) {
                console.log(response.statusCode)
                if (error) throw new Error(error);
                callback(null,response.statusCode)
            })
        }
    } 
    if(operationinput.Type == 'Storage Account'){
        if(operationinput.operation == 'delete'){
            var options = {
                'method': 'DELETE',
                //https://management.azure.com/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Storage/storageAccounts/{accountName}?api-version=2019-06-01
                'url':`https://management.azure.com/subscriptions/${operationinput.SubscriptionID}/resourceGroups/${operationinput.RGname}/providers/Microsoft.Storage/storageAccounts/${operationinput.VMname}?api-version=2019-06-01`,
                'headers': {
                    'Authorization': authToken,
                    'Content-type': 'application/json'
                }
            }
            request(options, function (error, response) {
                console.log(response.statusCode)
                if (error) throw new Error(error);
                callback(null,response.statusCode)
            })
        }
    } 
    if(operationinput.Type == 'SQL Database'){
        if(operationinput.operation == 'delete'){
            var options = {
                'method': 'DELETE',
                //https://management.azure.com/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Sql/servers/{serverName}/databases/{databaseName}?api-version=2017-10-01-preview
                'url':`https://management.azure.com/subscriptions/${operationinput.SubscriptionID}/resourceGroups/${operationinput.RGname}/providers/Microsoft.Sql/servers/${operationinput.ServerName}/databases/${operationinput.DBName}?api-version=2017-10-01-preview`,
                'headers': {
                    'Authorization': authToken,
                    'Content-type': 'application/json'
                }
            }
            request(options, function (error, response) {
                console.log(response.statusCode)
                if (error) throw new Error(error);
                callback(null,response.statusCode)
            })
        }
        if(operationinput.operation == 'start'){
            var options = {
                'method': 'POST',
                //https://management.azure.com/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Sql/servers/{serverName}/databases/{databaseName}/resume?api-version=2017-10-01-preview
                'url':`https://management.azure.com/subscriptions/${operationinput.SubscriptionID}/resourceGroups/${operationinput.RGname}/providers/Microsoft.Sql/servers/${operationinput.ServerName}/databases/${operationinput.DBName}/resume?api-version=2017-10-01-preview`,
                'headers': {
                    'Authorization': authToken,
                    'Content-type': 'application/json'
                }
            }
            request(options, function (error, response) {
                console.log(response.statusCode)
                if (error) throw new Error(error);
                callback(null,response.statusCode)
            })
        }
        if(operationinput.operation == 'stop'){
            var options = {
                'method': 'POST',
                //https://management.azure.com/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Sql/servers/{serverName}/databases/{databaseName}/pause?api-version=2017-10-01-preview
                'url':`https://management.azure.com/subscriptions/${operationinput.SubscriptionID}/resourceGroups/${operationinput.RGname}/providers/Microsoft.Sql/servers/${operationinput.ServerName}/databases/${operationinput.DBName}/pause?api-version=2017-10-01-preview`,
                'headers': {
                    'Authorization': authToken,
                    'Content-type': 'application/json'
                }
            }
            request(options, function (error, response) {
                if (error) throw new Error(error);
                if(response.statusCode == 400){  
                    callback(null,response.body)
                }
                else{ 
                callback(null,response.statusCode)
                }
            
            })
        }

    } 
    if(operationinput.Type == 'Container Registry'){
        if(operationinput.operation == 'delete'){
            var options = {
                'method': 'DELETE',
                //https://management.azure.com/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.ContainerRegistry/registries/{registryName}?api-version=2019-05-01
                'url':`https://management.azure.com/subscriptions/${operationinput.SubscriptionID}/resourceGroups/${operationinput.RGname}/providers/Microsoft.ContainerRegistry/registries/${operationinput.VMname}?api-version=2019-05-01`,
                'headers': {
                    'Authorization': authToken,
                    'Content-type': 'application/json'
                }
            }
            request(options, function (error, response) {
                console.log(response.statusCode)
                if (error) throw new Error(error);
                callback(null,response.statusCode)
            })
        }
    }
    if(operationinput.Type == 'Service Fabric Cluster'){
        if(operationinput.operation == 'delete'){

            var options = {
                'method': 'DELETE',
                //https://management.azure.com/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/resRg/providers/Microsoft.ServiceFabric/clusters/myCluster?api-version=2018-02-01
                'url':`https://management.azure.com/subscriptions/${operationinput.SubscriptionID}/resourceGroups/${operationinput.RGname}/providers/Microsoft.ServiceFabric/clusters/${operationinput.VMname}?api-version=2018-02-01`,
                'headers': {
                    'Authorization': authToken,
                    'Content-type': 'application/json'
                }
            }
            request(options, function (error, response) {
                console.log(response.statusCode)
                if (error) throw new Error(error);
                callback(null,response.statusCode)
            })
        }
    }
    if(operationinput.Type == 'Kubernetes Services'){
        if(operationinput.operation == 'delete'){

            var options = {
                'method': 'DELETE',
                //https://management.azure.com/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.ContainerService/managedClusters/{resourceName}?api-version=2020-03-01
                'url':`https://management.azure.com/subscriptions/${operationinput.SubscriptionID}/resourceGroups/${operationinput.RGname}/providers/Microsoft.ContainerService/managedClusters/${operationinput.VMname}?api-version=2020-03-01`,
                'headers': {
                    'Authorization': authToken,
                    'Content-type': 'application/json'
                }
            }
            request(options, function (error, response) {
                console.log(response.statusCode)
                if (error) throw new Error(error);
                callback(null,response.statusCode)
            })
        }
    }
    if(operationinput.Type == 'Container Instance'){
        if(operationinput.operation == 'stop'){

            var options = {
                'method': 'POST',
                //https://management.azure.com/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.ContainerInstance/containerGroups/{containerGroupName}/stop?api-version=2018-10-01
                'url':`https://management.azure.com/subscriptions/${operationinput.SubscriptionID}/resourceGroups/${operationinput.RGname}/providers/Microsoft.ContainerInstance/containerGroups/${operationinput.VMname}/stop?api-version=2018-10-01`,
                'headers': {
                    'Authorization': authToken,
                    'Content-type': 'application/json'
                }
            }
            request(options, function (error, response) {
                console.log(response.statusCode)
                if (error) throw new Error(error);
                callback(null,response.statusCode)
            })
        }
        if(operationinput.operation == 'start'){
            var options = {
                'method': 'POST',
                'url':`https://management.azure.com/subscriptions/${operationinput.SubscriptionID}/resourceGroups/${operationinput.RGname}/providers/Microsoft.ContainerInstance/containerGroups/${operationinput.VMname}/start?api-version=2018-10-01`,
                'headers': {
                    'Authorization': authToken,
                    'Content-type': 'application/json'
                }
            }
            request(options, function (error, response) {
                console.log(response.statusCode)
                if (error) throw new Error(error);
                callback(null,response.statusCode)
            })
        }
        if(operationinput.operation == 'Restart'){
            var options = {
                'method': 'POST',
                'url':`https://management.azure.com/subscriptions/${operationinput.SubscriptionID}/resourceGroups/${operationinput.RGname}/providers/Microsoft.ContainerInstance/containerGroups/${operationinput.VMname}/start?api-version=2018-10-01`,
                'headers': {
                    'Authorization': authToken,
                    'Content-type': 'application/json'
                }
            }
            request(options, function (error, response) {
                console.log(response.statusCode)
                if (error) throw new Error(error);
                callback(null,response.statusCode)
            })
        }
        if(operationinput.operation == 'delete'){
            var options = {
                'method': 'DELETE',
                //https://management.azure.com/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.ContainerInstance/containerGroups/{containerGroupName}?api-version=2018-10-01
                'url':`https://management.azure.com/subscriptions/${operationinput.SubscriptionID}/resourceGroups/${operationinput.RGname}/providers/Microsoft.ContainerInstance/containerGroups/${operationinput.VMname}?api-version=2018-10-01`,
                'headers': {
                    'Authorization': authToken,
                    'Content-type': 'application/json'
                }
            }
            request(options, function (error, response) {
                console.log(response.statusCode)
                if (error) throw new Error(error);
                callback(null,response.statusCode)
            })
        }
    }
    if(operationinput.Type == 'SQL Server'){
        if(operationinput.operation == 'delete'){
            var options = {
                'method': 'DELETE',
                //https://management.azure.com/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Sql/servers/{serverName}?api-version=2019-06-01-preview
                'url':`https://management.azure.com/subscriptions/${operationinput.SubscriptionID}/resourceGroups/${operationinput.RGname}/providers/Microsoft.Sql/servers/${operationinput.VMname}?api-version=2019-06-01-preview`,
                'headers': {
                    'Authorization': authToken,
                    'Content-type': 'application/json'
                }
            }
            request(options, function (error, response) {
                console.log(response.statusCode)
                if (error) throw new Error(error);
                callback(null,response.statusCode)
            })
        }
    }
    if(operationinput.Type == 'Azure Data Lake Generation 1'){
        if(operationinput.operation == 'delete'){
            var options = {
                'method': 'DELETE',
                //https://management.azure.com/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.DataLakeStore/accounts/{accountName}?api-version=2016-11-01
                'url':`https://management.azure.com/subscriptions/${operationinput.SubscriptionID}/resourceGroups/${operationinput.RGname}/providers/Microsoft.DataLakeStore/accounts/${operationinput.VMname}?api-version=2016-11-01`,
                'headers': {
                    'Authorization': authToken,
                    'Content-type': 'application/json'
                }
            }
            request(options, function (error, response) {
                console.log(response.statusCode)
                if (error) throw new Error(error);
                callback(null,response.statusCode)
            })
        }
    }
    if(operationinput.Type == 'Azure Cosmos Databse'){
        if(operationinput.operation == 'delete'){
            var options = {
                'method': 'DELETE',
                //https://management.azure.com/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.DocumentDB/databaseAccounts/{accountName}?api-version=2019-12-12 
                'url':`https://management.azure.com/subscriptions/${operationinput.SubscriptionID}/resourceGroups/${operationinput.RGname}/providers/Microsoft.DocumentDB/databaseAccounts/${operationinput.VMname}?api-version=2019-12-12`,
                'headers': {
                    'Authorization': authToken,
                    'Content-type': 'application/json'
                }
            }
            request(options, function (error, response) {
                console.log(response.statusCode)
                if (error) throw new Error(error);
                callback(null,response.statusCode)
            })
        }
    }
    if(operationinput.Type == 'Virtual Network'){
        if(operationinput.operation == 'delete'){
            var options = {
                'method': 'DELETE',
                //https://management.azure.com/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Network/virtualNetworks/{virtualNetworkName}?api-version=2020-03-01
                'url':`https://management.azure.com/subscriptions/${operationinput.SubscriptionID}/resourceGroups/${operationinput.RGname}/providers/Microsoft.Network/virtualNetworks/${operationinput.VMname}?api-version=2020-03-01`,
                'headers': {
                    'Authorization': authToken,
                    'Content-type': 'application/json'
                }
            }
            request(options, function (error, response) {
                console.log(response.statusCode)
                if(error)throw new Error(error)
                if(response.statusCode == 400){ 

                    callback(null,response.body)
                }
                else{ 
                callback(null,response.statusCode)
                }
            })
        }
    }
    if(operationinput.Type == 'Local Network Gateway'){
        if(operationinput.operation == 'delete'){
            var options = {
                'method': 'DELETE',
                //https://management.azure.com/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Network/localNetworkGateways/{localNetworkGatewayName}?api-version=2020-03-01
                'url':`https://management.azure.com/subscriptions/${operationinput.SubscriptionID}/resourceGroups/${operationinput.RGname}/providers/Microsoft.Network/localNetworkGateways/${operationinput.VMname}?api-version=2020-03-01`,
                'headers': {
                    'Authorization': authToken,
                    'Content-type': 'application/json'
                }
            }
            request(options, function (error, response) {
                console.log(response.statusCode)
                if(error)throw new Error(error)
                if(response.statusCode == 400){ 
                    callback(null,response.body)
                }
                else{ 
                callback(null,response.statusCode)
                }
            })
        }
    }
    if(operationinput.Type == 'Virtual Network Gateway'){
        if(operationinput.operation == 'delete'){
            var options = {
                'method': 'DELETE',
                //https://management.azure.com/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Network/virtualNetworkGateways/{virtualNetworkGatewayName}?api-version=2020-03-01
                'url':`https://management.azure.com/subscriptions/${operationinput.SubscriptionID}/resourceGroups/${operationinput.RGname}/providers/Microsoft.Network/virtualNetworkGateways/${operationinput.VMname}?api-version=2020-03-01`,
                'headers': {
                    'Authorization': authToken,
                    'Content-type': 'application/json'
                }
            }
            request(options, function (error, response) {
                console.log(response.statusCode)
                if (error) throw new Error(error);
                if(response.statusCode == 400){ 

                    callback(null,response.body)
                }
                else{ 
                callback(null,response.statusCode)
                }
            })
        }
    }
    if(operationinput.Type == 'Azure Firewall'){
        if(operationinput.operation == 'delete'){
            var options = {
                'method': 'DELETE',
                //https://management.azure.com/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Network/azureFirewalls/{azureFirewallName}?api-version=2020-03-01
                'url':`https://management.azure.com/subscriptions/${operationinput.SubscriptionID}/resourceGroups/${operationinput.RGname}/providers/Microsoft.Network/azureFirewalls/${operationinput.VMname}?api-version=2020-03-01`,
                'headers': {
                    'Authorization': authToken,
                    'Content-type': 'application/json'
                }
            }
            request(options, function (error, response) {
                console.log(response.statusCode)
                if (error) throw new Error(error);
                callback(null,response.statusCode)
            })
        }
    }
    if(operationinput.Type == 'App Service'){
        if(operationinput.operation == 'start'){
            var options = {
                'method': 'POST',
                //https://management.azure.com/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Web/sites/{name}/start?api-version=2019-08-01
                'url':`https://management.azure.com/subscriptions/${operationinput.SubscriptionID}/resourceGroups/${operationinput.RGname}/providers/Microsoft.Web/sites/${operationinput.VMname}/start?api-version=2019-08-01`,
                'headers': {
                    'Authorization': authToken,
                    'Content-type': 'application/json'
                }
            }
            request(options, function (error, response) {
                console.log(response.statusCode)
                if (error) throw new Error(error);
                callback(null,response.statusCode)
            })
        }
        if(operationinput.operation == 'stop'){
            console.log('here')
            var options = {
                'method': 'POST',
                //https://management.azure.com/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Web/sites/{name}/stop?api-version=2019-08-01
                'url':`https://management.azure.com/subscriptions/${operationinput.SubscriptionID}/resourceGroups/${operationinput.RGname}/providers/Microsoft.Web/sites/${operationinput.VMname}/stop?api-version=2019-08-01`,
                'headers': {
                    'Authorization': authToken,
                    'Content-type': 'application/json'
                }
            }
            request(options, function (error, response) {
                console.log(response.statusCode)
                if (error) throw new Error(error);
                callback(null,response.statusCode)
            })
        }
        if(operationinput.operation == 'delete'){
            var options = {
                'method': 'DELETE',
                //https://management.azure.com/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Web/sites/{name}?api-version=2019-08-01 
                'url':`https://management.azure.com/subscriptions/${operationinput.SubscriptionID}/resourceGroups/${operationinput.RGname}/providers/Microsoft.Web/sites/${operationinput.VMname}?api-version=2019-08-01`,
                'headers': {
                    'Authorization': authToken,
                    'Content-type': 'application/json'
                }
            }
            request(options, function (error, response) {
                console.log(response.statusCode)
                if (error) throw new Error(error);
                callback(null,response.statusCode)
            })
        }
        if(operationinput.operation == 'Restart'){
            var options = {
                'method': 'POST',
                //https://management.azure.com/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Web/sites/{name}/restart?api-version=2019-08-01
                'url':`https://management.azure.com/subscriptions/${operationinput.SubscriptionID}/resourceGroups/${operationinput.RGname}/providers/Microsoft.Web/sites/${operationinput.VMname}/restart?api-version=2019-08-01`,
                'headers': {
                    'Authorization': authToken,
                    'Content-type': 'application/json'
                }
            }
            request(options, function (error, response) {
                console.log(response.statusCode)
                if (error) throw new Error(error);
                callback(null,response.statusCode)
            })
        }
    }

    if(operationinput.Type == 'Logic App'){
        if(operationinput.operation == 'start'){
            var options = {
                'method': 'POST',
                //https://management.azure.com/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Logic/workflows/{workflowName}/enable?api-version=2016-06-01
                'url':`https://management.azure.com/subscriptions/${operationinput.SubscriptionID}/resourceGroups/${operationinput.RGname}/providers/Microsoft.Logic/workflows/${operationinput.VMname}/enable?api-version=2016-06-01`,
                'headers': {
                    'Authorization': authToken,
                    'Content-type': 'application/json'
                }
            }
            request(options, function (error, response) {
                console.log(response.statusCode)
                if (error) throw new Error(error);
                callback(null,response.statusCode)
            })
        }
        if(operationinput.operation == 'stop'){
            var options = {
                'method': 'POST',
                //https://management.azure.com/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Logic/workflows/{workflowName}/disable?api-version=2016-06-01 
                'url':`https://management.azure.com/subscriptions/${operationinput.SubscriptionID}/resourceGroups/${operationinput.RGname}/providers/Microsoft.Logic/workflows/${operationinput.VMname}/disable?api-version=2016-06-01 `,
                'headers': {
                    'Authorization': authToken,
                    'Content-type': 'application/json'
                }
            }
            request(options, function (error, response) {
                console.log(response.statusCode)
                if (error) throw new Error(error);
                callback(null,response.statusCode)
            })
        }
        if(operationinput.operation == 'delete'){
            var options = {
                'method': 'DELETE',
                //https://management.azure.com/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Logic/workflows/{workflowName}?api-version=2016-06-01
                'url':`https://management.azure.com/subscriptions/${operationinput.SubscriptionID}/resourceGroups/${operationinput.RGname}/providers/Microsoft.Logic/workflows/${operationinput.VMname}?api-version=2016-06-01`,
                'headers': {
                    'Authorization': authToken,
                    'Content-type': 'application/json'
                }
            }
            request(options, function (error, response) {
                console.log(response.statusCode)
                if (error) throw new Error(error);
                callback(null,response.statusCode)
            })
        }
    }

    if(operationinput.Type == 'API Management'){
        if(operationinput.operation == 'delete'){
            var options = {
                'method': 'DELETE',
                //https://management.azure.com/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.ApiManagement/service/{serviceName}?api-version=2019-12-01 
                'url':`https://management.azure.com/subscriptions/${operationinput.SubscriptionID}/resourceGroups/${operationinput.RGname}/providers/Microsoft.ApiManagement/service/${operationinput.VMname}?api-version=2019-12-01`,
                'headers': {
                    'Authorization': authToken,
                    'Content-type': 'application/json'
                }
            }
            request(options, function (error, response) {
                console.log(response.statusCode)
                if (error) throw new Error(error);
                callback(null,response.statusCode)
            })
        }
    }

    if(operationinput.Type == 'App Service Plan'){
        if(operationinput.operation == 'delete'){
            var options = {
                'method': 'DELETE',
                //https://management.azure.com/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Web/serverfarms/{name}?api-version=2019-08-01 
                'url':`https://management.azure.com/subscriptions/${operationinput.SubscriptionID}/resourceGroups/${operationinput.RGname}/providers/Microsoft.Web/serverfarms/${operationinput.VMname}?api-version=2019-08-01`,
                'headers': {
                    'Authorization': authToken,
                    'Content-type': 'application/json'
                }
            }
            request(options, function (error, response) {
                console.log(response.statusCode)
                if (error) throw new Error(error);
                callback(null,response.statusCode)
            })
        }
    }
    if(operationinput.Type == 'Virtual Network'){
        if(operationinput.operation == 'delete'){
            var options = {
                'method': 'DELETE',
                //https://management.azure.com/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Network/vpnGateways/{gatewayName}/vpnConnections/{connectionName}?api-version=2020-03-01
                'url':`https://management.azure.com/subscriptions/${operationinput.SubscriptionID}/resourceGroups/${operationinput.RGname}/providers/Microsoft.Network/vpnGateways/${operationinput.Gatewayname}/vpnConnections/${operationinput.VMname}?api-version=2020-03-01`,
                'headers': {
                    'Authorization': authToken,
                    'Content-type': 'application/json'
                }
            }
            request(options, function (error, response) {
                console.log(response.statusCode)
                if(error)throw new Error(error)
                if(response.statusCode == 400){ 

                    callback(null,response.body)
                }
                else{ 
                callback(null,response.statusCode)
                }
            })
        }
    }
    //'url':`https://management.azure.com/subscriptions/${operationinput.SubscriptionID}/resourceGroups/${operationinput.RGname}/providers/Microsoft.vpnGateways/vpnConnections/${operationinput.VMname}?api-version=2020-03-01`,
  
}
exports.operate = async function (req,res){
    try{
    authToken = req.header('Authorization')
    monitorOperation(req.body,authToken,function(err,data){
        console.log(req.body)
        if(err){console.log('error->',err)}
    
        res.send({
            "ResourceName":req.body.VMname,
            "operation":req.body.operation,
            "Type":req.body.Type,
            "status":"data",
            "Typeerr":data
            })
    })
    }catch(err){
        res.status(404).send({"Error":"Error in getting response"})
    }

}
