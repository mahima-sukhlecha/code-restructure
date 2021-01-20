
resource "azurerm_resource_group" "example" {
  name     = "${var.Resource_Group}"
  location = "${var.location}"
}

resource "azurerm_template_deployment" "example" {
  name                = "acctesttemplate-01"
  resource_group_name = azurerm_resource_group.example.name
  parameters = {
        "StorageAccountName" = "${var.StorageAccountName}"
        "StorageAccountReplication" ="${var.StorageAccountReplication}"
        "SCALocation" ="${var.SCALocation}"
        "sqlServerName" = "${var.sqlServerName}"
        "sqlAdministratorLogin" ="${var.sqlAdministratorLogin}"
        "sqlAdministratorPassword" ="${var.sqlAdministratorPassword}"
        "dataWarehouseName"="${var.dataWarehouseName}"
        "transparentDataEncryption"="${var.transparentDataEncryption}"
        "SQLdatawarehouselocation"="${var.SQLdatawarehouselocation}"
      }

  template_body = <<DEPLOY
{
    "$schema": "https://schema.management.azure.com/schemas/2019-04-01/deploymentTemplate.json#",
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
        "sqlServerName": {
            "type": "String",
            "metadata": {
                "description": "The SQL Logical Server name."
            }
        },
        "sqlAdministratorLogin": {
            "type": "String",
            "metadata": {
                "description": "The administrator username of the SQL Server."
            }
        },
        "sqlAdministratorPassword": {
            "type": "SecureString",
            "metadata": {
                "description": "The administrator password of the SQL Server."
            }
        },
        "dataWarehouseName": {
            "type": "String",
            "metadata": {
                "description": "The name of the Data Warehouse."
            }
        },
        "transparentDataEncryption": {
            "allowedValues": [
                "Enabled",
                "Disabled"
            ],
            "type": "String",
            "metadata": {
                "description": "Enable/Disable Transparent Data Encryption"
            }
        },
        "SQLdatawarehouselocation": {
            "type": "String",
            "metadata": {
                "description": "Resource location"
            }
        }
    },
    "variables": {
        "StorageAccountName": "[toLower( concat( parameters('StorageAccountName')))]"
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
            "type": "Microsoft.Sql/servers",
            "apiVersion": "2015-05-01-preview",
            "name": "[parameters('sqlServerName')]",
            "location": "[parameters('SQLdatawarehouselocation')]",
            "properties": {
                "administratorLogin": "[parameters('sqlAdministratorLogin')]",
                "administratorLoginPassword": "[parameters('sqlAdministratorPassword')]",
                "version": "12.0"
            },

        "resources": [
        {
        "type": "Microsoft.Sql/servers/firewallRules",
        "apiVersion": "2015-05-01-preview",
        "name": "[concat(parameters('sqlServerName'), '/AllowAllWindowsAzureIps')]",
        "dependsOn": [
            "[resourceId('Microsoft.Sql/servers', parameters('sqlServerName'))]"
        ],
        "properties": {
            "startIpAddress": "0.0.0.0",
            "endIpAddress": "255.255.255.255"
        }
        },
                {
                    "type": "databases",
                    "apiVersion": "2019-06-01-preview",
                    "name": "[parameters('dataWarehouseName')]",
                    "location": "[parameters('SQLdatawarehouselocation')]",
                    "dependsOn": [
                        "[parameters('sqlServerName')]"
                    ],
                    "sku": {
                        "name": "DataWarehouse",
                        "tier": "DataWarehouse",
                        "capacity": 9000
                    },
                    "kind": "v12.0,user,datawarehouse,gen2",
                    "properties": {
                        "collation": "SQL_Latin1_General_CP1_CI_AS",
                        "maxSizeBytes": 263882790666240,
                        "catalogCollation": "SQL_Latin1_General_CP1_CI_AS",
                        "readScale": "Disabled",
                        "readReplicaCount": 0,
                        "storageAccountType": "GRS"
                    }
                }
            ]
        }

    ]
}
DEPLOY

 deployment_mode = "Incremental"
}
