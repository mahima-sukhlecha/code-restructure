
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
        "ServerName" = "${var.ServerName}"
        "SQLLocation" ="${var.SQLLocation}"
        "AdministratorUserName" ="${var.AdministratorUserName}"
        "AdministratorPassword" ="${var.AdministratorPassword}"
        "DataBaseName" ="${var.DataBaseName}"
        "SkuTier" ="${var.SkuTier}"
        "SkuName" ="${var.SkuName}"
      }
  template_body = <<DEPLOY

            {
	"$schema": "https://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json#",
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
		"ServerName": {
			"type": "string",
			"defaultValue": "sqlserverv2"
		},
		"AdministratorUserName": {
			"type": "string",
			"defaultValue": "aditi"
		},
		"AdministratorPassword": {
			"type": "securestring",
			"defaultValue": "Password@1",
			"minLength": 8,
			"maxLength": 128
		},
		"DataBaseName": {
			"type": "string",
			"defaultValue": "sqldbvcv2"
		},
		"SQLLocation": {
			"type": "string",
			"defaultValue": "[resourceGroup().location]"
		},
		"SkuTier": {
			"type": "string",
			"defaultValue": "GeneralPurpose",
			"allowedValues": [
				"GeneralPurpose",
				"Hyperscale",
				"BusinessCritical"
			]
		},
		"SkuName": {
			"type": "string",
			"defaultValue": "GP_Gen4_1"
		}
	},

	"variables": {
		"StorageAccountName": "[toLower( concat( parameters('StorageAccountName') ))]"
	},
	"resources": [{
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
			"apiVersion": "2017-10-01-preview",
			"name": "[parameters('ServerName')]",
			"location": "[parameters('SQLLocation')]",
			"properties": {
				"administratorLogin": "[parameters('AdministratorUserName')]",
				"administratorLoginPassword": "[parameters('AdministratorPassword')]",
				"version": "12.0"
            }
        },
			 {
            "type": "Microsoft.Sql/servers/firewallRules",
            "apiVersion": "2015-05-01-preview",
            "name": "[concat(parameters('ServerName'), '/AllowAllWindowsAzureIps')]",
            "dependsOn": [
                "[resourceId('Microsoft.Sql/servers', parameters('ServerName'))]"
            ],
            "properties": {
                "startIpAddress": "0.0.0.0",
                "endIpAddress": "255.255.255.255"
            }
        },



			{
				"type": "Microsoft.Sql/servers/databases",
				"apiVersion": "2017-10-01-preview",
				"name": "[concat(parameters('ServerName'),'/',parameters('DataBaseName'))]",
				"location": "[parameters('SQLLocation')]",
				"dependsOn": [
					"[resourceId('Microsoft.Sql/servers',parameters('ServerName'))]"
				],
				"kind": "v12.0,user,vcore",
				"sku": {
					"name": "[parameters('SkuName')]",
					"tier": "[parameters('SkuTier')]"
				},
				"properties": {
					"collation": "SQL_Latin1_General_CP1_CI_AS",
					"maxSizeBytes": 34359738368,
					"catalogCollation": "SQL_Latin1_General_CP1_CI_AS",
					"zoneRedundant": false
				}
			}

	]
}
DEPLOY


  deployment_mode = "Incremental"
}
