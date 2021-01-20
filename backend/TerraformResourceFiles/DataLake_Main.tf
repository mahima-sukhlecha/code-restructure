
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
        "DataLakeStorageAccountName" = "${var.DataLakeStorageAccountName}"
        "ADLSLocation" ="${var.ADLSLocation}"
        "DatalakeStorageAccountReplication" ="${var.DatalakeStorageAccountReplication}"
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
		"DataLakeStorageAccountName": {
			"type": "string",
			"defaultValue": "sqlserverv2"
		},
		"ADLSLocation": {
			"type": "string",
			"defaultValue": "aditi"
		},
		"DatalakeStorageAccountReplication": {
			"type": "string",
			"metadata": {
				"description": "Choose a replication strategy that matches your durability requirements."
			},
			"allowedValues": [
				"Standard_LRS",
				"Standard_GRS",
				"Standard_RAGRS"
			]
		}
	},

	"variables": {
		"StorageAccountName": "[toLower( parameters('StorageAccountName'))]"
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
			"type": "Microsoft.Storage/storageAccounts",
			"apiVersion": "2019-06-01",
			"name": "[parameters('DataLakeStorageAccountName')]",
			"Location": "[parameters('ADLSLocation')]",
			"sku": {
				"name": "[parameters('DatalakeStorageAccountReplication')]",
				"tier": "Standard"
			},
			"kind": "StorageV2",
			"properties": {
				"isHnsEnabled": true,
				"networkAcls": {
					"bypass": "AzureServices",
					"virtualNetworkRules": [],
					"ipRules": [],
					"defaultAction": "Allow"
				},
				"supportsHttpsTrafficOnly": true,
				"encryption": {
					"services": {
						"file": {
							"keyType": "Account",
							"enabled": true
						},
						"blob": {
							"keyType": "Account",
							"enabled": true
						}
					},
					"keySource": "Microsoft.Storage"
				},
				"accessTier": "Hot"
			}
		},
		{
			"type": "Microsoft.Storage/storageAccounts/blobServices",
			"apiVersion": "2019-06-01",
			"name": "[concat(parameters('DataLakeStorageAccountName'), '/default')]",
			"dependsOn": [
				"[resourceId('Microsoft.Storage/storageAccounts', parameters('DataLakeStorageAccountName'))]"
			],
			"sku": {
				"name": "[parameters('DatalakeStorageAccountReplication')]"
			},
			"properties": {
				"cors": {
					"corsRules": []
				},
				"deleteRetentionPolicy": {
					"enabled": false
				}
			}
		},
		{
			"type": "Microsoft.Storage/storageAccounts/blobServices/containers",
			"apiVersion": "2019-06-01",
			"name": "[concat(parameters('DataLakeStorageAccountName'), '/default/marketplace')]",
			"dependsOn": [
				"[resourceId('Microsoft.Storage/storageAccounts/blobServices', parameters('DataLakeStorageAccountName'), 'default')]",
				"[resourceId('Microsoft.Storage/storageAccounts', parameters('DataLakeStorageAccountName'))]"
			],
			"properties": {
				"publicAccess": "Container"
			}
		}
	]
}
DEPLOY


  deployment_mode = "Incremental"
}
