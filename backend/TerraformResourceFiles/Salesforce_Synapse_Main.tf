resource "azurerm_resource_group" "example" {
  name     = "${var.Resource_Group}"
  location = "${var.location}"
}

resource "azurerm_template_deployment" "example" {
  name                = "acctesttemplate-03"
  resource_group_name = azurerm_resource_group.example.name
parameters = {
        #"count"="8"
        "DataFactoryName" ="${var.DataFactoryName}"
        "DataFactoryLocation" ="${var.DataFactoryLocation}"
        "StorageConnectionString" = "${var.StorageConnectionString}"
        "AzureSynapseAnalyticsConnectionString" ="${var.AzureSynapseAnalyticsConnectionString}"
         "Sources" ="${var.Sources}"
        "SalesForceUsername" = "${var.SalesForceUsername}"
        "SalesForcePassword" ="${var.SalesForcePassword}"
        "SalesForceToken" = "${var.SalesForceToken}"
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
      "StorageConnectionString": {
        "type": "string",
        "defaultValue": ""

      },
      "AzureSynapseAnalyticsConnectionString": {
        "type": "securestring"
      },
  	"Sources": {
			"type": "string",
			"defaultValue": "SalesForce"

		},
		"SalesForceUsername": {
			"type": "string",
			"defaultValue": ""
		},
		"SalesForcePassword": {
			"type": "string",
			"defaultValue": ""
		},
		"SalesForceToken": {
			"type": "string",
			"defaultValue": ""
		},
		"SalesForceTables": {
			"type": "string",
			"defaultValue": ""
		},
      "BlobTable":{
      "type": "array",
      "defaultValue": [
      {
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
      "AzureSynapseAnalyticsLinkedservice": "AzureSynapseAnalyticsLS",
      "AzureSynapseAnalyticsDatasets": "AzureSynapseAnalyticsDS",
	    "SalesForceLinkedService": "SalesForceLS",
		"SalesForceDS": "SalesForceDS",
		"SalesForcePipeline": "SalesForcePipeline"
    },
         "resources": [
        {
          "type": "Microsoft.DataFactory/factories",
          "apiVersion": "[variables('api-version')]",
          "name": "[parameters('DataFactoryName')]",
          "location": "[parameters('DataFactoryLocation')]",
          "resources": [
            {
              "type": "linkedservices",
              "apiVersion": "[variables('api-version')]",
              "name": "[variables('AzureSynapseAnalyticsLinkedservice')]",
              "dependsOn": [
                "[resourceId('Microsoft.DataFactory/factories',parameters('DataFactoryName'))]"
              ],
              "properties": {
                "type": "AzureSqlDW",
                "typeProperties": {
                  "connectionString": {
                    "type": "SecureString",
                    "value": "[parameters('AzureSynapseAnalyticsConnectionString')]"
                  }
                }
              }
            },
            {
                "type": "datasets",
                "apiVersion": "[variables('api-version')]",
                "name": "[variables('AzureSynapseAnalyticsDatasets')]",
                "dependsOn": [
                  "[resourceId('Microsoft.DataFactory/factories',parameters('DataFactoryName'))]",
                  "[variables('AzureSynapseAnalyticsLinkedservice')]"
                ],
                "properties": {
                  "type": "AzureSqlDWTable",
                  "linkedServiceName": {
                    "referenceName": "[variables('AzureSynapseAnalyticsLinkedservice')]",
                    "type": "LinkedServiceReference"
                  },
                  "schema": [],
                  "parameters": {
                    "tablelist": {
                      "type": "array"
                    }
                  },
                  "typeProperties": {
                    "tableName": {
                      "value": "@dataset().tablelist",
                      "type": "Expression"
                    }
                  }
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
                      "value": "[parameters('StorageConnectionString')]"
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
				"condition": "[equals(parameters('Sources'),'SalesForce')]",
				"type": "linkedservices",
				"apiVersion": "2017-09-01-preview",
				"name": "[variables('SalesForceLinkedService')]",
				"dependsOn": [
					"[resourceId('Microsoft.DataFactory/factories',parameters('DataFactoryName'))]"
				],
				"properties": {
					"type": "Salesforce",
					"description": "Salesforce linked service",
					"typeProperties": {
						"username": "[parameters('SalesForceUsername')]",
						"password": "[parameters('SalesForcePassword')]",
						"securityToken": "[parameters('SalesForceToken')]"
					}
				}
			},
			{
				"condition": "[equals(parameters('Sources'),'SalesForce')]",
				"type": "datasets",
				"apiVersion": "[variables('api-version')]",
				"name": "[variables('SalesForceDS')]",
				"dependsOn": [
					"[parameters('DataFactoryName')]",
					"[variables('SalesForceLinkedService')]"
				],
				"properties": {
					"type": "SalesforceObject",
					"typeProperties": {
						"objectApiName": "Contact"
					},
					"linkedServiceName": {
						"referenceName": "[variables('SalesForceLinkedService')]",
						"type": "LinkedServiceReference"
					}
				}
			},

			{
				"condition": "[equals(parameters('Sources'),'SalesForce')]",
				"type": "pipelines",
				"apiVersion": "[variables('api-version')]",
				"name": "[variables('SalesForcePipeline')]",
				"dependsOn": [
					"[parameters('DataFactoryName')]",
					"[variables('SALinkedService')]",
					"[variables('SADS')]",
					"[variables('SalesForceLinkedService')]",
					"[variables('SalesForceDS')]",
					"[variables('AzureSynapseAnalyticsLinkedservice')]",
					"[variables('AzureSynapseAnalyticsDatasets')]"

				],
				"properties": {
					"activities": [{
						"name": "SFForEachActivity",
						"type": "ForEach",
						"dependsOn": [],
						"userProperties": [],
						"typeProperties": {
							"items": {
								"value": "@pipeline().parameters.SFtablelist",
								"type": "Expression"
							},
							"isSequential": true,
							"activities": [{
									"name": "SalesForcetoBlob",
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
											"type": "SalesforceSource",
											"query": {
												"value": "SELECT * FROM @{item().objects_name}",
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
										"referenceName": "[variables('SalesForceDS')]",
										"type": "DatasetReference",
										"parameters": {}
									}],
									"outputs": [{
										"referenceName": "[variables('SADS')]",
										"type": "DatasetReference",
										"parameters": {
											"sinkfilename": {
												"value": "@{item().objects_name}.csv",
												"type": "Expression"
											}
										}
									}]
								},
								{
									"name": "BlobtoDatawarehouse",
									"type": "Copy",
									"dependsOn": [{
										"activity": "SalesForcetoBlob",
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
												"value": "@{item().objects_name}.csv",
												"type": "Expression"
											}
										}
									}],
									"outputs": [{
										"referenceName": "[variables('AzureSynapseAnalyticsDatasets')]",
										"type": "DatasetReference",
										"parameters": {
											"tablelist": {
												"value": "dbo.[@{item().objects_name}]",
												"type": "Expression"
											}
										}
									}]
								}
							]
						}
					}],
					"parameters": {
						"SFtablelist": {
							"type": "array",
							"defaultValue": "[parameters('SalesForceTables')]"
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
        