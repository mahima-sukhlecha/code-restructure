resource "azurerm_resource_group" "example" {
  name     = "${var.Resource_Group}"
  location = "${var.location}"
}

resource "azurerm_template_deployment" "example" {
  name                = "acctesttemplate-03"
  resource_group_name = azurerm_resource_group.example.name
parameters = {
        "StorageAccountName" = "${var.StorageAccountName}"
        "StorageAccountReplication" ="${var.StorageAccountReplication}"
        "SCALocation" ="${var.SCALocation}"
        "serverName" = "${var.ServerName}"
        "SQLLocation" ="${var.SQLLocation}"
        "administratorLogin" ="${var.administratorLogin}"
        "administratorLoginPassword" ="${var.administratorLoginPassword}"
        "DataBaseName" ="${var.DataBaseName}"
        "elasticPoolName" ="${var.elasticPoolName}"
        "tier" ="${var.tier}"
        "SkuName" ="${var.SkuName}"
      }
  template_body = <<DEPLOY

{
    "$schema": "http://schema.management.azure.com/schemas/2014-04-01-preview/deploymentTemplate.json#",
    "contentVersion": "1.0.0.0",
    "parameters": {
        "StorageAccountName": {
			"type": "string",
			"defaultValue": " ",
			"metadata": {
				"description": "The name of Storage Account"
			}
		},
		"StorageAccountReplication": {
			"type": "string",
			"metadata": {
				"description": "Choose a replication strategy that matches your durability requirements."
			},
			"allowedValues": [
				"Standard_LRS",
				"Standard_GRS",
				"Standard_RAGRS"
			]
		},
		"SCALocation": {
			"type": "string",
			"defaultValue": "[resourceGroup().location]",
			"metadata": {
				"description": "Location of all resources."
			}
		},
        "administratorLogin": {
            "type": "string"
        },
        "administratorLoginPassword": {
            "type": "securestring"
        },
        "serverName": {
            "type": "string"
        },
        "SQLLocation": {
            "type": "string"
        },
        "DataBaseName": {
            "type": "string",
            "defaultValue": ""
          },
        "elasticPoolName": {
            "type": "string"
        },
        "SkuName": {
            "type": "string",
            "defaultValue": "GP_Gen5_2"

        },
        "tier": {
            "type": "string",
            "defaultValue": "GeneralPurpose"

        },
        "poolLimit": {
            "type": "string",
         "defaultValue": "2"

        },
        "poolSize": {
            "type": "string",
            "defaultValue": "34359738368"

        },
        "perDatabasePerformanceMin": {
            "type": "string",
            "defaultValue": "0"

        },
        "perDatabasePerformanceMax": {
            "type": "string",
            "defaultValue": "2"

        },
        "zoneRedundant": {
            "type": "bool",
            "defaultValue": false
        },
        "licenseType": {
            "type": "string",
            "defaultValue": ""
        },
        "allowAzureIps": {
            "type": "bool",
            "defaultValue": true
        }
    },
"variables": {
		"StorageAccountName": "[toLower( parameters('StorageAccountName') )]"
	},
        "resources": [
            {
			"type": "Microsoft.Storage/storageAccounts",
			"apiVersion": "2019-04-01",
			"name": "[variables('StorageAccountName')]",
			"location": "[parameters('SCALocation')]",
			"sku": {
				"name": "[parameters('StorageAccountReplication')]"
			},
			"kind": "StorageV2",
			"properties": {},
			"resources": [{
				"type": "blobServices/containers",
				"apiVersion": "2019-04-01",
				"name": "[concat('default/', 'marketplace')]",
				"dependsOn": [
					"[resourceId('Microsoft.Storage/storageAccounts',variables('StorageAccountName'))]"
				],
				"properties": {
					"publicAccess": "Container"
				}
			}]
		},
        {
            "apiVersion": "2015-05-01-preview",
            "location": "[parameters('SQLLocation')]",
            "name": "[parameters('serverName')]",
            "properties": {
                "administratorLogin": "[parameters('administratorLogin')]",
                "administratorLoginPassword": "[parameters('administratorLoginPassword')]",
                "version": "12.0"
            },
            "type": "Microsoft.Sql/servers"
        },
                {
                    "apiVersion": "2017-10-01-preview",
                    "dependsOn": [
                        "[concat('Microsoft.Sql/servers/', parameters('serverName'))]"
                    ],
                    "location": "[parameters('SQLLocation')]",
                    "name": "[concat(parameters('serverName'), '/', parameters('elasticPoolName'))]",
                    "sku": {
                        "name": "[parameters('SkuName')]",
                        "tier": "[parameters('tier')]",
                        "capacity": "[parameters('poolLimit')]"
                    },
                    "properties": {
                        "perDatabaseSettings": {
                            "minCapacity": "[parameters('perDatabasePerformanceMin')]",
                            "maxCapacity": "[parameters('perDatabasePerformanceMax')]"
                        },
                        "maxSizeBytes": "[parameters('poolSize')]",
                        "zoneRedundant": "[parameters('zoneRedundant')]",
                        "licenseType": "[parameters('licenseType')]"
                    },
                    "type": "Microsoft.Sql/servers/elasticpools"
                },
 {
            "type": "Microsoft.Sql/servers/firewallRules",
            "apiVersion": "2015-05-01-preview",
            "name": "[concat(parameters('serverName'), '/AllowAllWindowsAzureIps')]",
            "dependsOn": [
                "[resourceId('Microsoft.Sql/servers', parameters('serverName'))]"
            ],
            "properties": {
                "startIpAddress": "0.0.0.0",
                "endIpAddress": "255.255.255.255"
            }
        },

                {
                  "type": "Microsoft.Sql/servers/databases",
                  "apiVersion": "2017-10-01-preview",
                  "name": "[concat(parameters('serverName'),'/',parameters('DataBaseName'))]",
                  "location": "[parameters('SQLLocation')]",
                  "dependsOn": [
                    "[resourceId('Microsoft.Sql/servers',parameters('serverName'))]"
                  ],
                  "kind": "v12.0,user,vcore",
                  "sku": {
                    "name": "[parameters('SkuName')]",
                    "tier": "[parameters('tier')]"
                  },
                  "properties": {
                     "collation": "SQL_Latin1_General_CP1_CI_AS",
                      "maxSizeBytes": 34359738368,
                      "requestedServiceObjectiveName": "ElasticPool",

                "elasticPoolName": "[parameters('elasticPoolName')]",
                      "catalogCollation": "SQL_Latin1_General_CP1_CI_AS",
                      "zoneRedundant": false
                  }
                }


    ]
}
 DEPLOY


  deployment_mode = "Incremental"
}
