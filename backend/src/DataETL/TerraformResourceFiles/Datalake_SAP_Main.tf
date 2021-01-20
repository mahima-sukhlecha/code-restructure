
resource "azurerm_resource_group" "example" {
  name     = "${var.Resource_Group}"
  location = "${var.location}"
}

resource "azurerm_template_deployment" "example" {
  name                = "acctesttemplate-03"
  resource_group_name = azurerm_resource_group.example.name
parameters = {
        #"count"="8"
        "SAPTables" = "${var.SAPTables}"
        "DataFactoryName" ="${var.DataFactoryName}"
        "DataFactoryLocation" ="${var.DataFactoryLocation}"
        "Storageaccesskey" = "${var.Storageaccesskey}"
		DataLakeStorageAccountName = "${var.DataLakeStorageAccountName}"
        "DataLakeStoaregConnectionString" ="${var.DataLakeStoaregConnectionString}"
        "Sources" ="${var.Sources}"
        "SAPServer" = "${var.SAPServer}"
	     "SAPUsername"="${var.SAPUsername}" 
        "SAPPassword" ="${var.SAPPassword}"
      }
  template_body = <<DEPLOY

{
	"$schema": "https://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json#",
	"contentVersion": "1.0.0.0",
	"parameters": {
		"DataFactoryName": {
			"type": "string",
			"defaultValue": " "
		},
		"DataFactoryLocation": {
			"type": "string",
			"defaultValue": " Central US",
			"allowedValues": [
				"Australia East",
				"Brazil South",
				"Canada Central",
				"Central India",
				"Central US",
				"East US",
				"East US 2",
				"France Central",
				"Japan East",
				"North Europe",
				"South Central US",
				"Southeast Asia",
				"UK South",
				"West Central US",
				"West Europe",
				"West US",
				"West US 2"
			]
		},
		"Storageaccesskey": {
			"type": "string",
			"defaultValue": ""

		},
		"DataLakeStoaregConnectionString": {
			"type": "securestring"
		},

		"DataLakeStorageAccountName": {
			"type": "securestring"
		},
		"Sources": {
			"type": "string",
			"defaultValue": "SAP"

		},
		"SAPServer": {
			"type": "string",
			"defaultValue": ""
		},
		"SAPUsername": {
			"type": "string",
			"defaultValue": ""
		},
		"SAPPassword": {
			"type": "string",
			"defaultValue": ""
		},
		"SAPTables": {
			"type": "string"
		},
		"BlobTable": {
			"type": "array",
			"defaultValue": [{
					"table_name": "Account"
				},
				{
					"table_name": "Contact"
				}
			]
		}
	},
	"variables": {
		"api-version": "2018-06-01",
		"integrationrt": "integrationRuntime1",
		"SALinkedService": "StorageAccountLS",
		"SADS": "StorageAccountDS",
		"SADSStaging": "SADSStaging",
		"DatalakeLinkedServicegen2": "datalakeLinkedServicegen2",
		"Datalakedatasetsgen2": "datalakedatasetsgen2",
		"SAPLinkedService": "SAPLS",
		"SAPDataSet": "SAPDS",
		"SAPPipeline": "SAPPipeline"
	},
	"resources": [{
		"type": "Microsoft.DataFactory/factories",
		"apiVersion": "[variables('api-version')]",
		"name": "[parameters('DataFactoryName')]",
		"location": "[parameters('DataFactoryLocation')]",
		"resources": [{
				"type": "linkedservices",
				"apiVersion": "[variables('api-version')]",
				"name": "[variables('DatalakeLinkedServicegen2')]",
				"dependsOn": [
					"[resourceId('Microsoft.DataFactory/factories',parameters('DataFactoryName'))]"
				],
				"properties": {
				"type": "AzureBlobFS",
				"typeProperties": {
               "url": "[concat('https://', parameters('DataLakeStorageAccountName'),'.dfs.core.windows.net')]", 
               "accountkey": { 
                "type": "SecureString", 
                "value": "[parameters('DataLakeStoaregConnectionString')]" 
            }
        }
				}
			},
			{
				"type": "datasets",
				"apiVersion": "[variables('api-version')]",
				"name": "[variables('Datalakedatasetsgen2')]",
				"dependsOn": [
					"[resourceId('Microsoft.DataFactory/factories',parameters('DataFactoryName'))]",
					"[variables('DatalakeLinkedServicegen2')]"
				],
				"properties": {
					"linkedServiceName": {
						"referenceName": "[variables('DatalakeLinkedServicegen2')]",
						"type": "LinkedServiceReference"
					},
					"parameters": {
						"tablelist": {
							"type": "array"
						}
					},
					"annotations": [],
					"type": "DelimitedText",
					"typeProperties": {
						"location": {
							"type": "AzureBlobStorageLocation",
							"fileName": {
								"value": "@dataset().tablelist",
								"type": "Expression"
							},
							"container": "marketplace"
						},
						"columnDelimiter": ",",
						"escapeChar": "\\",
						"firstRowAsHeader": true,
						"quoteChar": "\""
					},
					"schema": []
				}
			},

			{
				"type": "linkedservices",
				"apiVersion": "[variables('api-version')]",
				"name": "[variables('SALinkedService')]",
				"dependsOn": [
					"[resourceId('Microsoft.DataFactory/factories',parameters('DataFactoryName'))]"
				],
				"properties": {
					"type": "AzureBlobStorage",
					"description": "Azure Storage linked service",
					"typeProperties": {
						"connectionString": {
							"type": "SecureString",
							"value": "[parameters('Storageaccesskey')]"
						}
					}
				}
			},
			{
				"name": "[variables('SADS')]",
				"type": "datasets",
				"apiVersion": "[variables('api-version')]",
				"dependsOn": [
					"[resourceId('Microsoft.DataFactory/factories',parameters('DataFactoryName'))]",
					"[variables('SALinkedService')]"
				],
				"properties": {
					"linkedServiceName": {
						"referenceName": "[variables('SALinkedService')]",
						"type": "LinkedServiceReference"
					},
					"parameters": {
						"sinkfilename": {
							"type": "array"
						}
					},
					"annotations": [],
					"type": "DelimitedText",
					"typeProperties": {
						"location": {
							"type": "AzureBlobStorageLocation",
							"fileName": {
								"value": "@dataset().sinkfilename",
								"type": "Expression"
							},
							"container": "marketplace"
						},
						"columnDelimiter": ",",
						"escapeChar": "\\",
						"firstRowAsHeader": true,
						"quoteChar": "\""
					},
					"schema": []
				}
			},
			{
				"name": "[variables('SADSStaging')]",
				"type": "datasets",
				"apiVersion": "[variables('api-version')]",
				"dependsOn": [
					"[resourceId('Microsoft.DataFactory/factories',parameters('DataFactoryName'))]",
					"[variables('SALinkedService')]"
				],
				"properties": {
					"linkedServiceName": {
						"referenceName": "[variables('SALinkedService')]",
						"type": "LinkedServiceReference"
					},
					"parameters": {
						"Staging_Blob": {
							"type": "string"
						}
					},
					"annotations": [],
					"type": "DelimitedText",
					"typeProperties": {
						"location": {
							"type": "AzureBlobStorageLocation",
							"fileName": {
								"value": "@dataset().Staging_Blob",
								"type": "Expression"
							},
							"container": "marketplace"
						},
						"columnDelimiter": ",",
						"escapeChar": "\\",
						"firstRowAsHeader": true,
						"quoteChar": "\""
					},
					"schema": []
				}
			},
			{
				"condition": "[equals(parameters('Sources'),'SAP')]",
				"type": "linkedservices",
				"apiVersion": "[variables('api-version')]",
				"name": "[variables('SAPLinkedService')]",
				"dependsOn": [
					"[resourceId('Microsoft.DataFactory/factories',parameters('DataFactoryName'))]"
				],
				"properties": {
					"type": "SapHana",
					"typeProperties": {
						"server": "[parameters('SAPServer')]",
						"authenticationType": "Basic",
						"userName": "[parameters('SAPUsername')]",
						"password": {
							"type": "SecureString",
							"value": "[parameters('SAPPassword')]"
						}
					},
					"connectVia": {
						"referenceName": "[variables('integrationrt')]",
						"type": "IntegrationRuntimeReference"
					}
				}
			},
			{
				"condition": "[equals(parameters('Sources'),'SAP')]",
				"name": "[variables('SAPDataSet')]",
				"type": "datasets",
				"apiVersion": "[variables('api-version')]",
				"dependsOn": [
					"[resourceId('Microsoft.DataFactory/factories',parameters('DataFactoryName'))]",
					"[variables('SAPLinkedService')]"
				],
				"properties": {
					"type": "RelationalTable",
					"linkedServiceName": {
						"referenceName": "[variables('SAPLinkedService')]",
						"type": "LinkedServiceReference"
					},
					"typeProperties": {}
				}
			},
			{
				"condition": "[equals(parameters('Sources'),'SAP')]",
				"type": "pipelines",
				"apiVersion": "[variables('api-version')]",
				"name": "[variables('SAPPipeline')]",
				"dependsOn": [
					"[parameters('DataFactoryName')]",
					"[variables('SALinkedService')]",
					"[variables('SADS')]",
					"[variables('SAPLinkedService')]",
					"[variables('SAPDataSet')]",
					"[variables('DatalakeLinkedServicegen2')]",
					"[variables('Datalakedatasetsgen2')]"

				],
				"properties": {
					"activities": [{
						"name": "SAPForEachActivity",
						"type": "ForEach",
						"dependsOn": [],
						"userProperties": [],
						"typeProperties": {
							"items": {
								"value": "@pipeline().parameters.SAPtablelist",
								"type": "Expression"
							},
							"isSequential": true,
							"activities": [{
									"name": "SAPtoBlob",
									"type": "Copy",
									"dependsOn": [],
									"policy": {
										"timeout": "7.00:00:00",
										"retry": 0,
										"retryIntervalInSeconds": 30,
										"secureOutput": false,
										"secureInput": false
									},
									"userProperties": [],
									"typeProperties": {
										"source": {
											"type": "RelationalSource",
											"query": {
												"value": "SELECT * FROM @{item().table_schema}.@{item().table_name}",
												"type": "Expression"
											}
										},
										"sink": {
											"type": "DelimitedTextSink",
											"storeSettings": {
												"type": "AzureBlobStorageWriteSetting"
											},
											"formatSettings": {
												"type": "DelimitedTextWriteSetting",
												"quoteAllText": true,
												"fileExtension": ".csv"
											}
										},
										"enableStaging": false
									},
									"inputs": [{
										"referenceName": "[variables('SAPDataSet')]",
										"type": "DatasetReference"
									}],
									"outputs": [{
										"referenceName": "[variables('SADS')]",
										"type": "DatasetReference",
										"parameters": {
											"sinkfilename": {
												"value": "@{item().table_schema}_@{item().table_name}.csv",
												"type": "Expression"
											}
										}
									}]
								},
								{
									"name": "BlobtoDataLake",
									"type": "Copy",
									"dependsOn": [{
										"activity": "SAPtoBlob",
										"dependencyConditions": [
											"Succeeded"
										]
									}],
									"policy": {
										"timeout": "7.00:00:00",
										"retry": 0,
										"retryIntervalInSeconds": 30,
										"secureOutput": false,
										"secureInput": false
									},
									"userProperties": [],
									"typeProperties": {
										"source": {
											"type": "DelimitedTextSource",
											"storeSettings": {
												"type": "AzureBlobStorageReadSetting",
												"recursive": false,
												"enablePartitionDiscovery": false
											},
											"formatSettings": {
												"type": "DelimitedTextReadSetting"
											}
										},
										"sink": {
											"type": "AzureSqlSink",
											"tableOption": "autoCreate"
										},
										"enableStaging": false
									},
									"inputs": [{
										"referenceName": "[variables('SADS')]",
										"type": "DatasetReference",
										"parameters": {
											"sinkfilename": {
												"value": "@{item().table_schema}_@{item().table_name}.csv",
												"type": "Expression"
											}
										}
									}],
									"outputs": [{
										"referenceName": "[variables('Datalakedatasetsgen2')]",
										"type": "DatasetReference",
										"parameters": {
											"tablelist": {
												"value": "@{item().table_schema}_@{item().table_name}.csv",
												"type": "Expression"
											}
										}
									}]
								}
							]
						}
					}],
					"parameters": {
						"SAPtablelist": {
							"type": "array",
							"defaultValue": "[parameters('SAPTables')]"
						}
					},
					"annotations": []
				}
			}
		]
	}]
}
      DEPLOY


  deployment_mode = "Incremental"
}     
