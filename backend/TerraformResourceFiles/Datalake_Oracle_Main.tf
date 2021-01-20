resource "azurerm_resource_group" "example" {
  name     = "${var.Resource_Group}"
  location = "${var.location}"
}

resource "azurerm_template_deployment" "example" {
  name                = "acctesttemplate-03"
  resource_group_name = azurerm_resource_group.example.name
parameters = {
        
        "DataFactoryName" ="${var.DataFactoryName}"
        "DataFactoryLocation" ="${var.DataFactoryLocation}"
        "Storageaccesskey" = "${var.Storageaccesskey}"
		DataLakeStorageAccountName = "${var.DataLakeStorageAccountName}"
        "DataLakeStoaregConnectionString" ="${var.DataLakeStoaregConnectionString}"
        "Sources" ="${var.Sources}"
        "Sources" ="${var.Sources}"
        "Oracle_Host" = "${var.Oracle_Host}"
        "Oracle_Port" = "${var.Oracle_Port}"
	    "Oracle_SID"="${var.Oracle_SID}" 
        "Oracle_Username" ="${var.Oracle_Username}"
         "Oracle_Password" ="${var.Oracle_Password}"
         "OracleTables" ="${var.OracleTables}"
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
        "defaultValue": "Oracle"
        
      },
      "Oracle_Host": {
        "type": "string",
        "defaultValue": ""
      },
      "Oracle_Port": {
        "type": "string",
        "defaultValue": ""
      },
      "Oracle_SID": {
        "type": "string",
        "defaultValue": ""
      },
      "Oracle_Username": {
        "type": "string",
        "defaultValue": ""
      },
      "Oracle_Password": {
        "type": "string",
        "defaultValue": ""
      },
      "OracleTables": {
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
		"integrationruntime": "AutoResolveIntegrationRuntime",
		"SALinkedService": "StorageAccountLS",
		"SADS": "StorageAccountDS",
		"SADSStaging": "SADSStaging",
		"DatalakeLinkedServicegen2": "datalakeLinkedServicegen2",
		"Datalakedatasetsgen2": "datalakedatasetsgen2",
		"OracleLinkedService": "OracleLS",
      "OracleDataSet": "OracleDS",
      "OraclePipeline": "OraclePipeline"
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
                "condition": "[equals(parameters('Sources'),'Oracle')]",
                "type": "linkedservices",
                "apiVersion": "[variables('api-version')]",
                "name": "[variables('OracleLinkedService')]",
                "dependsOn": [
                  "[resourceId('Microsoft.DataFactory/factories',parameters('DataFactoryName'))]"
                ],
                "properties": {
                  "type": "Oracle",
                  "typeProperties": {
                       "connectionString": "[concat('host=', parameters('Oracle_Host'),';port=',parameters('Oracle_Port'),';sid=',parameters('Oracle_SID'),';user id=', parameters('Oracle_Username'))]",
                    "authenticationType": "Basic",
                    "server": "[parameters('Oracle_Host')]",
                    "userName": "[parameters('Oracle_Username')]",
                    "password": {
                      "type": "SecureString",
                      "value": "[parameters('Oracle_Password')]"
                    }
                  },
                  "connectVia": {
                    "referenceName": "[variables('integrationrt')]",
                    "type": "IntegrationRuntimeReference"
                  }
                }
              },
              {
                "condition": "[equals(parameters('Sources'),'Oracle')]",
                "name": "[variables('OracleDataSet')]",
                "type": "datasets",
                "apiVersion": "[variables('api-version')]",
                "dependsOn": [
                  "[resourceId('Microsoft.DataFactory/factories',parameters('DataFactoryName'))]",
                  "[variables('OracleLinkedService')]"
                ],
                "properties": {
                  "type": "OracleTable",
                  "linkedServiceName": {
                    "referenceName": "[variables('OracleLinkedService')]",
                    "type": "LinkedServiceReference"
                  },
                  "typeProperties": {}
                }
              },
              {
                "condition": "[equals(parameters('Sources'),'Oracle')]",
                "type": "pipelines",
                "apiVersion": "[variables('api-version')]",
                "name": "[variables('OraclePipeline')]",
                "dependsOn": [
                  "[parameters('DataFactoryName')]",
                  "[variables('SALinkedService')]",
                  "[variables('SADS')]",
                  "[variables('OracleLinkedService')]",
                  "[variables('OracleDataSet')]",
                  "[variables('DatalakeLinkedServicegen2')]",
                  "[variables('Datalakedatasetsgen2')]"
      
                ],
                "properties": {
                  "activities": [
                    {
                      "name": "OracleForEachActivity",
                      "type": "ForEach",
                      "dependsOn": [],
                      "userProperties": [],
                      "typeProperties": {
                        "items": {
                          "value": "@pipeline().parameters.Oracletablelist",
                          "type": "Expression"
                        },
                        "isSequential": true,
                        "activities": [
                          {
                            "name": "OracletoBlob",
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
                                "type": "OracleSource",
                                 "oracleReaderQuery": "SELECT * FROM @{item().table_schema}.@{item().table_name}",
                                  "partitionOption": "None",
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
                            "inputs": [
                              {
                                "referenceName": "[variables('OracleDataSet')]",
                                "type": "DatasetReference"
                              }
                            ],
                            "outputs": [
                              {
                                "referenceName": "[variables('SADS')]",
                                "type": "DatasetReference",
                                "parameters": {
                                  "sinkfilename": {
                                    "value": "@{item().table_schema}_@{item().table_name}.csv",
                                    "type": "Expression"
                                  }
                                }
                              }
                            ]
                          },
                          {
                            "name": "Blobtodatalakestorage",
                            "type": "Copy",
                            "dependsOn": [
                              {
                                "activity": "OracletoBlob",
                                "dependencyConditions": [
                                  "Succeeded"
                                ]
                              }
                            ],
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
                            "inputs": [
                              {
                                "referenceName": "[variables('SADS')]",
                                "type": "DatasetReference",
                                "parameters": {
                                  "sinkfilename": {
                                    "value": "@{item().table_schema}_@{item().table_name}.csv",
                                    "type": "Expression"
                                  }
                                }
                              }
                            ],
                            "outputs": [
                              {
                                "referenceName": "[variables('Datalakedatasetsgen2')]",
                                "type": "DatasetReference",
                                "parameters": {
                                  "tablelist": {
                                    "value": "@{item().table_schema}_@{item().table_name}.csv",
                                    "type": "Expression"
                                  }
                                }
                              }
                            ]
                          }
                        ]
                      }
                    }
                  ],
                  "parameters": {
                    "Oracletablelist": {
                      "type": "array",
                      "defaultValue": "[parameters('OracleTables')]"
                    }
                  },
                  "annotations": []
                }
              }
          ]
               }
      ]
    }
      DEPLOY


  deployment_mode = "Incremental"
}     
